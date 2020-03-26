import * as cp from 'child_process';
import { log } from 'logol';
import { promisify } from 'util';
import { html } from 'jsx-pragmatic';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';
import { ensureFile, outputFile } from 'fs-extra';

import { srcPath, distPath, config } from './config';
import { Page, Props } from './lib';

const exec = promisify(cp.exec as any);
const globAsync = promisify(glob);

export async function compile() {
    const output = await exec(
        `babel ${srcPath} --out-dir ${config.tmpFolder}`,
        {
            stdio: 'inherit',
            shell: true,
        },
    );

    await generatePages();
}

async function generatePages() {
    const basePath = join(config.tmpFolder, config.pagesFolder);
    const files = await globAsync(join(basePath, '**', '*.*'));
    log('Pages component founds', files);
    for (const file of files) {
        const filename = basename(file, extname(file));
        const htmlPath = join(
            distPath,
            join(
                dirname(file),
                filename === 'index' ? '' : filename,
                'index.html',
            ).substr(basePath.length),
        );

        log('Load page component', file);
        const page: Page = require(file).default;
        if (page.propsList) {
            for (const props of page.propsList) {
                await saveComponentToHtml(
                    page,
                    applyPropsToHtmlPath(htmlPath, props),
                    props,
                );
            }
        } else {
            await saveComponentToHtml(page, htmlPath);
        }
    }
}

function applyPropsToHtmlPath(htmlPath: string, props: Props) {
    let htmlPathWithProps = htmlPath;
    Object.keys(props).forEach(key => {
        htmlPathWithProps = htmlPathWithProps.replace(`[${key}]`, props[key]);
    });
    return htmlPathWithProps;
}

async function saveComponentToHtml(
    page: Page,
    htmlPath: string,
    props?: Props,
) {
    log('Generate page', htmlPath);
    console.log('yyoyoyoy', page.component(props));
    const source = page.component(props).render(html());

    await ensureFile(htmlPath);
    await outputFile(htmlPath, source);
}
