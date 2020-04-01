import { resolve, join } from 'path';
import { dirSync } from 'tmp';

export const CONFIG_FILE = 'radka.config';
export const ROOT_FOLDER = process.env.ROOT_FOLDER
    ? resolve(process.env.ROOT_FOLDER)
    : process.cwd();

export let config = {
    srcFolder: 'src',
    distFolder: 'site',
    pagesFolder: 'pages',
    pagesSuffix: '.page',
    bundleFolder: 'bundle',
    baseUrl: '',
    tmpFolder: process.env.TEMP_FOLDER || dirSync().name,
};

export let distPath = '';
export let srcPath = '';
export let pagesPath = '';
export let bundlePath = '';
initPath();

export function setConfig(newConfig = {}) {
    config = { ...config, ...newConfig };
    initPath();
}

function initPath() {
    distPath = join(ROOT_FOLDER, config.distFolder);
    srcPath = join(ROOT_FOLDER, config.srcFolder);
    pagesPath = join(config.tmpFolder, config.pagesFolder);
    bundlePath = join(config.tmpFolder, config.bundleFolder);
}
