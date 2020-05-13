import { log } from 'logol';
import { promisify } from 'util';
import { html } from 'jsx-pragmatic';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';
import { ensureFile, outputFile, readFile } from 'fs-extra';
import urlJoin from 'url-join';

import { paths, config } from './config';
import { Page, Props, rkaLoader, GetPropsList } from './lib';
import { fileToMd5 } from './utils';

const globAsync = promisify(glob);

export async function generatePages() {
    const pagePaths = await collectPagePaths();
    for (const pagePath of Object.values(pagePaths)) {
        await generatePage(pagePath, pagePaths);
    }
}

export async function generatePage(pagePath: PagePath, pagePaths: PagePaths) {
    const { file, page } = pagePath;
    const htmlPath = join(paths.distStatic, getRoutePath(file));
    log('Load page component', file);
    page.setPaths(paths);
    if (page.getPropsList) {
        await generateDynamicPage(
            pagePath,
            pagePaths,
            htmlPath,
            page.getPropsList,
        );
    } else {
        await saveComponentToHtml(pagePath, pagePaths, htmlPath);
    }
}

export async function generateDynamicPage(
    pagePath: PagePath,
    pagePaths: PagePaths,
    htmlPath: string,
    getPropsList: GetPropsList,
) {
    const { propsList, next } = getPropsList();
    for (const props of propsList) {
        await saveComponentToHtml(
            pagePath,
            pagePaths,
            applyPropsToPath(htmlPath, props),
            props,
        );
    }
    if (next) {
        await generateDynamicPage(pagePath, pagePaths, htmlPath, next);
    }
}

interface PagePath {
    file: string;
    page: Page;
    imports: string[];
}
type PagePaths = { [pathId: string]: PagePath };

export async function collectPagePaths(): Promise<PagePaths> {
    const files = await globAsync(
        join(paths.tmpPages, '**', `*${config.pagesSuffix}.js`),
    );
    log('Pages component founds', files);
    const pagePaths = {};
    // First cleanup cache separetly else it will interfer with page-ids
    files.forEach((file) => delete require.cache[file]);
    files.forEach((file) => {
        (global as any).r_ka_imports = []; // clean up before appending import
        const page: Page = require(file).default;
        pagePaths[page.linkId] = {
            file,
            page,
            imports: (global as any).r_ka_imports,
        };
    });
    // console.log('keys', Object.keys(pagePaths));
    return pagePaths;
}

function getRoutePath(file: string, glue = join) {
    const filename = basename(file, `${config.pagesSuffix}${extname(file)}`);
    const path = glue(
        dirname(file),
        filename === 'index' ? '' : filename,
        'index.html',
    ).substr(paths.tmpPages.length);

    return path;
}

function applyPropsToPath(path: string, props: Props) {
    let pathWithProps = path;
    Object.keys(props).forEach((key) => {
        pathWithProps = pathWithProps.replace(`[${key}]`, props[key]);
    });
    return pathWithProps;
}

async function saveComponentToHtml(
    { page, imports }: PagePath,
    links: PagePaths,
    htmlPath: string,
    props?: Props,
) {
    log('Generate page', htmlPath);
    let source = page.component(props).render(html());
    source = applyPropsToLinks(source, links);
    source = await appendImportToSource(source, imports, '.js', 'script');
    source = await appendImportToSource(source, imports, '.css', 'style');
    source = await injectBundles(source);

    await ensureFile(htmlPath);
    await outputFile(htmlPath, source);
}

async function appendImportToSource(source: string, imports: string[], ext: string, tag: string) {
    const importsContent = await Promise.all(
        imports
            .filter((path: string) => path.endsWith(ext))
            .map((path: string) =>
                readFile(join(config.tmpFolder, path.substr(paths.src.length))),
            ),
    );

    let code = importsContent.map((s) => s.toString()).join(';');
    if (ext === '.js') {
        code = rkaLoader('r_ka_imports', code);
    }
    return injectScript(source, `<${tag}>${code}</${tag}>`);
}

function applyPropsToLinks(source: string, links: PagePaths) {
    return source.replace(
        /%link%([^%]+)%([^%]*)%/g, // [^%] = all exepct %
        (match, linkId, propsStr) => {
            const props = {};
            propsStr.split(';').forEach((prop) => {
                const [key, value] = prop.split('=');
                props[key] = value;
            });
            return (
                config.baseUrl +
                applyPropsToPath(
                    getRoutePath(links[linkId].file, urlJoin).replace(
                        /\/index.html$/g,
                        '',
                    ) || '/',
                    props,
                )
            );
        },
    );
}

async function injectBundles(source: string) {
    const { baseUrl } = config;
    const script = `
    <script src="${baseUrl}/index.js?${await fileToMd5(
        join(paths.distStatic, 'index.js'),
    )}" data-turbolinks-suppress-warning></script>
    <link rel="stylesheet" type="text/css" href="${baseUrl}/index.css?${await fileToMd5(
        join(paths.distStatic, 'index.css'),
    )}">`;
    return injectScript(source, script);
    // return injectScript(source, script, '</head>');
}

function injectScript(source: string, script: string, tag = '</body>') {
    if (source.indexOf(tag) !== -1) {
        source = source.replace(tag, `${script}${tag}`);
    } else if (tag === '</head>') {
        source = `${script}${source}`;
    } else {
        source = `${source}${script}`;
    }
    return source;
}
