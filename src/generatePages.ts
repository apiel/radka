import { log } from 'logol';
import { promisify } from 'util';
// ToDo: we could keep using the default jsx-pragmatic html since we dont customize
// import { html } from 'jsx-pragmatic';
import { html } from './html';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';
import { ensureFile, outputFile, readFile } from 'fs-extra';
import urlJoin from 'url-join';
import * as md5 from 'md5';

import { paths, config } from './config';
import { Page, Props, rkaLoader } from './lib';
import { transform } from './transform';

const globAsync = promisify(glob);

export async function generatePages() {
    // console.log('yoyoy', join(pagesPath, '**', `*${config.pagesSuffix}.js`));
    const files = await globAsync(
        join(paths.pages, '**', `*${config.pagesSuffix}.js`),
    );
    const links = collectPageLinks(files);
    log('Pages component founds', links);
    for (const file of files) {
        const htmlPath = join(paths.distStatic, getRoutePath(file));
        log('Load page component', file);
        const page: Page = require(file).default;
        page.setPaths(paths);
        if (page.propsList) {
            for (const props of page.propsList) {
                await saveComponentToHtml(
                    page,
                    applyPropsToPath(htmlPath, props),
                    links,
                    props,
                );
            }
        } else {
            await saveComponentToHtml(page, htmlPath, links);
        }
    }
}

type Links = { [linkId: string]: string };
function collectPageLinks(files: string[]): Links {
    const links = {};
    files.forEach((file) => {
        const page: Page = require(file).default;
        links[page.linkId] = file;
    });
    return links;
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
    links: Links,
    props?: Props,
) {
    log('Generate page', htmlPath);
    let source = page.component(props).render(html({ transform }));
    source = applyPropsToLinks(source, links);
    source = await appendImportToSource(source, '.js', 'script');
    source = await appendImportToSource(source, '.css', 'style');
    source = await injectBundles(source);
    (global as any).r_ka_imports = []; // clean up after appending import

    await ensureFile(htmlPath);
    await outputFile(htmlPath, source);
}

async function appendImportToSource(source: string, ext: string, tag: string) {
    const imports = await Promise.all(
        (global as any).r_ka_imports
            .filter((path: string) => path.endsWith(ext))
            .map((path: string) =>
                readFile(join(config.tmpFolder, path.substr(paths.pages.length))),
            ),
    );

    let code = imports.map((s) => s.toString()).join();
    if (ext === '.js') {
        code = rkaLoader('r_ka_imports', code);
    }
    return injectScript(source, `<${tag}>${code}</${tag}>`);
}

function applyPropsToLinks(source: string, links: Links) {
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
                    getRoutePath(links[linkId], urlJoin).replace(
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
    const script = `
    <script src="${config.baseUrl}/index.js?${await getCacheParam(
        'index.js',
    )}" data-turbolinks-suppress-warning></script>
    <link rel="stylesheet" type="text/css" href="${
        config.baseUrl
    }/index.css?${await getCacheParam('index.css')}">`;
    return injectScript(source, script);
    // return injectScript(source, script, '</head>');
}

async function getCacheParam(filename: string) {
    return md5((await readFile(join(paths.distStatic, filename))).toString());
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
