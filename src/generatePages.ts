import { log } from 'logol';
import { promisify } from 'util';
// ToDo: we could keep using the default jsx-pragmatic html since we dont customize
// import { html } from 'jsx-pragmatic';
import { html } from './html';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';
import { ensureFile, outputFile, readFile } from 'fs-extra';

import { distPath, config, pagesPath } from './config';
import { Page, Props } from './lib';
import { transform } from './transform';

const globAsync = promisify(glob);

export async function generatePages() {
    const files = await globAsync(
        join(pagesPath, '**', `*${config.pagesSuffix}.js`),
    );
    const links = collectPageLinks(files);
    log('Pages component founds', links);
    for (const file of files) {
        const htmlPath = join(distPath, getRoutePath(file));
        log('Load page component', file);
        const page: Page = require(file).default;
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
    files.forEach(file => {
        const page: Page = require(file).default;
        links[page.linkId] = file;
    });
    return links;
}

// ToDo: using this for link will be wrong on windows, need to fix
function getRoutePath(file: string) {
    const filename = basename(file, `${config.pagesSuffix}${extname(file)}`);
    return join(
        dirname(file),
        filename === 'index' ? '' : filename,
        'index.html',
    ).substr(pagesPath.length);
}

function applyPropsToPath(path: string, props: Props) {
    let pathWithProps = path;
    Object.keys(props).forEach(key => {
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
    source = injectBundles(source);
    source = await appendImportToSource(source, '.js', 'script');
    source = await appendImportToSource(source, '.css', 'style');
    (global as any).r_ka_imports = []; // clean up after appending import

    await ensureFile(htmlPath);
    await outputFile(htmlPath, source);
}

async function appendImportToSource(source: string, ext: string, tag: string) {
    const imports = await Promise.all(
        (global as any).r_ka_imports
            .filter((path: string) => path.endsWith(ext))
            .map((path: string) =>
                readFile(join(config.tmpFolder, path.substr(pagesPath.length))),
            ),
    );

    const code = imports.map(s => s.toString()).join();
    return injectScript(source, `<${tag}>${code}</${tag}>`);
}

function applyPropsToLinks(source: string, links: Links) {
    return source.replace(
        /%link%([^%]+)%([^%]*)%/g, // [^%] = all exepct %
        (match, linkId, propsStr) => {
            const props = {};
            propsStr.split(';').forEach(prop => {
                const [key, value] = prop.split('=');
                props[key] = value;
            });
            return applyPropsToPath(getRoutePath(links[linkId]), props);
        },
    );
}

function injectBundles(source: string) {
    // ToDo: we might want to had ?timestamp base on creation time
    const script = `
    <script src="/index.js"></script>
    <link rel="stylesheet" type="text/css" href="/index.css">`;
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
