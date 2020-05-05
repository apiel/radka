import { log } from 'logol';
import { promisify } from 'util';
import { html } from 'jsx-pragmatic';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';
import { ensureFile, outputFile, readFile } from 'fs-extra';
import urlJoin from 'url-join';

import { paths, config } from './config';
import { Page, Props, rkaLoader } from './lib';
import { fileToMd5 } from './utils';

const globAsync = promisify(glob);

export async function generatePages() {
    const pagePaths = await collectPagePaths();
    for (const pagePath of Object.values(pagePaths)) {
        await generatePage(pagePath, pagePaths);
    }
}

export async function generatePage(
    { page, file }: PagePath,
    pagePaths: PagePaths,
) {
    const htmlPath = join(paths.distStatic, getRoutePath(file));
    log('Load page component', file);
    page.setPaths(paths);
    if (page.propsList) {
        for (const props of page.propsList) {
            await saveComponentToHtml(
                page,
                applyPropsToPath(htmlPath, props),
                pagePaths,
                props,
            );
        }
    } else {
        await saveComponentToHtml(page, htmlPath, pagePaths);
    }
}

interface PagePath {
    file: string;
    page: Page;
}
type PagePaths = { [pathId: string]: PagePath };

export async function collectPagePaths(): Promise<PagePaths> {
    const files = await globAsync(
        join(paths.pages, '**', `*${config.pagesSuffix}.js`),
    );
    log('Pages component founds', files);
    const pagePaths = {};
    // First cleanup cache separetly else it will interfer with page-ids
    files.forEach((file) => delete require.cache[file]);
    (global as any).r_ka_imports = []; // clean up before appending import
    files.forEach((file) => {
        const page: Page = require(file).default;
        pagePaths[page.linkId] = { file, page };
    });
    // console.log('keys', Object.keys(pagePaths));
    return pagePaths;
}

function getRoutePath(file: string, glue = join) {
    const filename = basename(file, `${config.pagesSuffix}${extname(file)}`);
    return glue(
        dirname(file),
        filename === 'index' ? '' : filename,
        'index.html',
    ).substr(paths.pages.length);
}

function applyPropsToPath(path: string, props: Props) {
    let pathWithProps = path;
    Object.keys(props).forEach((key) => {
        pathWithProps = pathWithProps.replace(`[${key}]`, props[key]);
    });
    return pathWithProps;
}

async function saveComponentToHtml(
    page: Page,
    htmlPath: string,
    links: PagePaths,
    props?: Props,
) {
    log('Generate page', htmlPath);
    let source = page.component(props).render(html());
    source = applyPropsToLinks(source, links);
    // console.log('r_ka_imports', (global as any).r_ka_imports);
    source = await appendImportToSource(source, '.js', 'script');
    source = await appendImportToSource(source, '.css', 'style');
    source = await injectBundles(source);

    await ensureFile(htmlPath);
    await outputFile(htmlPath, source);
}

async function appendImportToSource(source: string, ext: string, tag: string) {
    const imports = await Promise.all(
        (global as any).r_ka_imports
            .filter((path: string) => path.endsWith(ext))
            .map((path: string) =>
                readFile(
                    join(config.tmpFolder, path.substr(paths.pages.length)),
                ),
            ),
    );

    let code = imports.map((s) => s.toString()).join();
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
