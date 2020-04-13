import { info } from 'logol';
import { pathExists, copy, remove } from 'fs-extra';
import { watch } from 'chokidar';
import { join } from 'path';

import { setDev, paths, config } from './config';
import { build, runIsomor, runBabel, runParcel } from './compile';
import { fileIsInRoot, fileToMd5 } from './utils';

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
    if (fileIsInRoot(filePath, config.apiFolder)) {
        await runIsomor();
        // we could build babel and bundle only if api definition changed
        await buildStatic();
    }
    await copy(join(paths.src, filePath), join(paths.distServer, filePath));
}

async function buildStatic() {
    const md5RkaImport = await fileToMd5(paths.rkaImport);
    await remove(config.tmpFolder);
    await runBabel();
    if (md5RkaImport !== (await fileToMd5(paths.rkaImport))) {
        console.log('new import, need to run parcel', md5RkaImport, (await fileToMd5(paths.rkaImport)));
        // After having some issue with `parcel serve` (build loop forever)
        // let just rebuild everything till with find a solution
        await runParcel();
    }
}

/*
watch for file changes:
- done. if api files: then isomor transpile and build bundle only if new api endpoint (compare file to before, md5)
- if others files: build babel and generate pages
    + if possible generate only page changed: might be difficult since there is
      child component, unless we make a tree dependency of each component
    + think to a way to limit pages generation on dynamic pages
    + if new import then build bundle again (by file comparison, md5)
- if changes in bundle folder: build bundle
*/
