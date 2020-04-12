import { resolve, join } from 'path';
import { dirSync } from 'tmp';

export const ASSETS_EXT = ['.png', '.jpg', '.gif'];
export const RKA_IMPORT_FILE = 'r_ka-import.js';
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
    assetsFolder: 'r-ka-assets',
    baseUrl: '',
    tmpFolder: process.env.TEMP_FOLDER || dirSync().name,
    turbolinks: 'true',
};

export let paths = {
    distStatic: '',
    distServer: '',
    src: '',
    pages: '',
    bundle: '',
    assets: '',
};
initPaths();

export function setConfig(newConfig = {}) {
    config = { ...config, ...newConfig };
    initPaths();
}

function initPaths() {
    const distStatic = join(ROOT_FOLDER, config.distStaticFolder);
    paths = {
        distStatic,
        distServer: join(ROOT_FOLDER, config.distServerFolder),
        src: join(ROOT_FOLDER, config.srcFolder),
        pages: join(config.tmpFolder, config.pagesFolder),
        bundle: join(config.tmpFolder, config.bundleFolder),
        assets: join(distStatic, config.assetsFolder),
    };
}
