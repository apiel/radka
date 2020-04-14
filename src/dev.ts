import { info } from 'logol';
import { pathExists, copy, remove } from 'fs-extra';
import { watch } from 'chokidar';
import { join, basename, extname } from 'path';

import { setDev, paths, config } from './config';
import { build, runIsomor, runBabel, runParcel } from './compile';
import { fileIsInRoot, fileToMd5 } from './utils';
import { generatePages, generatePage, collectPagePaths } from './generatePages';
import { server } from './server';

export async function dev(rebuild: boolean) {
    info('Run Radka.js in dev mode');
    setDev();

    if (rebuild || !(await pathExists(paths.distStatic))) {
        await build();
    }
    watcher();

    // if server files changed, need to reload
    await server();
}

function watcher() {
    info('Starting watch mode.');
    watch('.', {
        ignoreInitial: true,
        // ignored: getServerSubFolderPattern(serverFolderPattern),
        cwd: paths.src,
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    })
        .on('ready', () => info('Initial scan complete. Ready for changes...'))
        .on('add', (file) => {
            info(`File ${file} has been added`);
            handleFile(file);
        })
        .on('change', (file) => {
            info(`File ${file} has been changed`);
            handleFile(file);
        })
        .on('unlink', (file) => {
            info(`File ${file} has been removed`, '(do nothing)');
        });
}

async function handleFile(filePath: string) {
    if (filePath.startsWith(config.apiFolder)) {
        await handleApiFile(filePath);
    } else if (filePath.startsWith(config.bundleFolder)) {
        await buildStatic(true);
    } else {
        await handleOtherFile(filePath);
    }
}

async function handleOtherFile(filePath: string) {
    await buildStatic();
    if (filePath.startsWith(config.pagesFolder)) {
        const pagePaths = await collectPagePaths();
        // this might be too dangerous, maybe better to just generate all pages
        const file = join(
            paths.pages,
            basename(filePath, extname(filePath)) + '.js',
        );
        await generatePage(file, pagePaths);
    } else {
        await generatePages();
    }
}

async function handleApiFile(filePath: string) {
    if (fileIsInRoot(filePath, config.apiFolder)) {
        await runIsomor();
        // we could build babel and bundle only if api definition changed
        await buildStatic();
    }
    await copy(join(paths.src, filePath), join(paths.distServer, filePath));
}

async function buildStatic(forceParcel = false) {
    const md5RkaImport = await fileToMd5(paths.rkaImport);
    await remove(config.tmpFolder);
    await runBabel();
    if (md5RkaImport !== (await fileToMd5(paths.rkaImport))) {
        console.log(
            'new import, need to run parcel',
            md5RkaImport,
            await fileToMd5(paths.rkaImport),
        );
        // After having some issue with `parcel serve` (build loop forever)
        // let just rebuild everything till with find a solution
        await runParcel();
    }
}

/*
+ think to a way to limit pages generation on dynamic pages

- need to reload page automatically
- need to serve
*/
