import { info } from 'logol';
import { pathExists, copy } from 'fs-extra';
import { watch } from 'chokidar';
import { join } from 'path';

import { setDev, paths, config } from './config';
import { build, runIsomor, runBabel } from './compile';
import { fileIsInRoot } from './utils';

export async function dev(rebuild: boolean) {
    info('Run Radka.js in dev mode');
    setDev();

    if (rebuild || !(await pathExists(paths.distStatic))) {
        await build();
    }
    watcher();
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
    } else {
        console.log('another file');
    }
}

async function handleApiFile(filePath: string) {
    console.log('api file');
    if (fileIsInRoot(filePath, config.apiFolder)) {
        console.log('fileIsInRoot');
        await runIsomor();
        // we could build babel and bundle only if api definition changed
        // need build babel and bundle
    }
    await copy(join(paths.src, filePath), join(paths.distServer, filePath));
}

async function buildStatic() {
    await runBabel();
}



/*
watch for file changes:
- if api files: then isomor transpile and build bundle only if new api endpoint (compare file to before, md5)
- if others files: build babel and generate pages
    + if possible generate only page changed: might be difficult since there is
      child component, unless we make a tree dependency of each component
    + think to a way to limit pages generation on dynamic pages
    + if new import then build bundle again (by file comparison, md5)
- if changes in bundle folder: build bundle
*/
