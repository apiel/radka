import { resolve, join } from 'path';
import { dirSync } from 'tmp';

export const CONFIG_FILE = 'radka.config';
export const ROOT_FOLDER = process.env.ROOT_FOLDER
    ? resolve(process.env.ROOT_FOLDER)
    : process.cwd();

export let config = {
    srcFolder: 'src',
    distStaticFolder: join('site', 'static'),
    distServerFolder: join('site', 'server'),
    apiFolder: 'api',
    pagesFolder: 'pages',
    pagesSuffix: '.page',
    bundleFolder: 'bundle',
    baseUrl: '',
    tmpFolder: process.env.TEMP_FOLDER || dirSync().name,
    turbolinks: 'true',
};

export let distStaticPath = '';
export let distServerPath = '';
export let srcPath = '';
export let pagesPath = '';
export let bundlePath = '';
initPath();

export function setConfig(newConfig = {}) {
    config = { ...config, ...newConfig };
    initPath();
}

function initPath() {
    distStaticPath = join(ROOT_FOLDER, config.distStaticFolder);
    distServerPath = join(ROOT_FOLDER, config.distServerFolder);
    srcPath = join(ROOT_FOLDER, config.srcFolder);
    pagesPath = join(config.tmpFolder, config.pagesFolder);
    bundlePath = join(config.tmpFolder, config.bundleFolder);
}
