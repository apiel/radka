import { info } from 'logol';
import { pathExists, copy, remove, writeFile } from 'fs-extra';
import { watch } from 'chokidar';
import { join, basename, extname } from 'path';
import { Server } from 'http';
import * as md5 from 'md5';

import { setDev, paths, config, getBundleFile } from './config';
import { build, runIsomor, runBabel, runParcel } from './compile';
import { fileIsInRoot, fileToMd5 } from './utils';
import { generatePages, generatePage, collectPagePaths } from './generatePages';
import { server } from './server';
import { rkaLoader } from './lib';

let serv: Server;

export async function dev(rebuild: boolean) {
    info('Run Radka.js in dev mode');
    setDev();

    if (rebuild || !(await pathExists(paths.distStatic))) {
        await build();
    }
    watcher();
    await startServer();
}

async function startServer() {
    if (serv) {
        serv.close();
    }
    // skip timeout for hot reloading
    const skipTimeout = true;
    serv = (await server(skipTimeout)).server;
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
        const pagePath = pagePaths[md5(join(paths.src, filePath))];
        await generatePage(pagePath, pagePaths);
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
    await startServer();
}

async function buildStatic(forceParcel = false) {
    const md5RkaImport = await fileToMd5(paths.rkaImport);
    await remove(config.tmpFolder);
    await runBabel();
    if (forceParcel || md5RkaImport !== (await fileToMd5(paths.rkaImport))) {
        // ToDo: fix, might be missing the first time
        // await injectHotReloadToBundle();
        // After having some issue with `parcel serve` (build loop forever)
        // let just rebuild everything till with find a solution
        await runParcel();
    }
}

function injectHotReloadToBundle() {
    const code = `const { subscribe } = require("isomor");
    console.log('sub to hot reload');
    subscribe((payload) => payload === "r_ka_reload" && location.reload());`;
    return writeFile(getBundleFile(), rkaLoader('r_ka_reload', code));
}

/*
+ think to a way to limit pages generation on dynamic pages

- need to reload page automatically
*/
