import { info, warn } from 'logol';
import { copy, remove } from 'fs-extra';
import { watch } from 'chokidar';
import { join, extname } from 'path';
import { Server } from 'http';
import { isomorWsEvent } from 'isomor-server';
import { WsServerAction } from 'isomor';
import * as WebSocket from 'ws';
import * as md5 from 'md5';

import { setDev, paths, config } from './config';
import {
    build,
    runIsomor,
    runBabel,
    runParcel,
    injectBaseCodeToBundle,
} from './compile';
import { fileIsInRoot, fileToMd5 } from './utils';
import { generatePages, generatePage, collectPagePaths } from './generatePages';
import { server } from './server';
import { rkaLoader } from './lib';

let serv: Server;

export async function dev(skipRebuild: boolean) {
    info('Run Radka.js in dev mode');
    setDev();

    if (!skipRebuild) {
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
        await buildStatic(filePath);
    } else {
        await handleOtherFile(filePath);
    }
    triggerClientReload();
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

async function buildStatic(filePath?: string) {
    const md5RkaImport = await fileToMd5(paths.rkaImport);
    await remove(config.tmpFolder);
    await runBabel();
    if (filePath || md5RkaImport !== (await fileToMd5(paths.rkaImport))) {
        await injectBaseCodeToBundle();
        await runParcel();
    }
}

export function injectHotReloadToBundle() {
    // ToDo: get url from config?
    const code = `const { subscribe, openWS } = require("isomor");
    subscribe((payload) => payload === "r_ka_reload" && location.reload());
    openWS("ws://127.0.0.1:3005");`;
    // return writeFile(getBundleFile(), rkaLoader('r_ka_reload', code));

    return rkaLoader('r_ka_reload', code);
}

// right now we support only one instance at once for hot reload
// to support multiple, we would have to create an array of open connection
let wsClient: WebSocket;
isomorWsEvent.on('connection', (ws) => {
    wsClient = ws;
    // we should think to set wsClient to null when connect got close
});
function triggerClientReload() {
    if (wsClient) {
        // ToDo: use wsSend from isomor, need to export first
        // WsServerAction.PUSH
        const msg = JSON.stringify({
            action: WsServerAction.PUSH,
            id: 'HR',
            payload: 'r_ka_reload',
        });
        wsClient.send(msg);
    }
}
