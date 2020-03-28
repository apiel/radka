import * as cp from 'child_process';
import { log } from 'logol';
import { promisify } from 'util';
// import { html } from 'jsx-pragmatic';
import { html } from './html';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';
import { ensureFile, outputFile } from 'fs-extra';

import { srcPath, distPath, config, pagesPath } from './config';
import { Page, Props } from './lib';
import { transform } from './transform';

const exec = promisify(cp.exec as any);
const globAsync = promisify(glob);

export async function compile() {
    const configPath = join(__dirname, '..', '.babelrc.jsx.json');
    const output = await exec(
        `babel ${srcPath} --out-dir ${config.tmpFolder} --config-file ${configPath}`,
        {
            stdio: 'inherit',
            shell: true,
        },
    );

    await generatePages();
}

async function generatePages() {
    const files = await globAsync(join(pagesPath, '**', '!(*.script).*'));
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

// using this for link will be wrong on windows
// need to fix
function getRoutePath(file: string) {
    const filename = basename(file, extname(file));
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
    const source = page.component(props).render(html({ transform }));
    const sourceWithLinks = applyPropsToLinks(source, links);

    await ensureFile(htmlPath);
    await outputFile(htmlPath, sourceWithLinks);
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
