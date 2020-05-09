import { resolve, join } from 'path';
import { dirSync } from 'tmp';

export let DEV = false;
export const ASSETS_EXT = ['.png', '.jpg', '.gif', '.otf', '.ttc', '.ttf', '.pdf', '.ico'];
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
    distServerApi: '',
    src: '',
    tmpPages: '',
    srcPages: '',
    srcApi: '',
    tmpBundle: '',
    assets: '',
    rkaImport: '',
    tmpBundleEntry: '',
};
initPaths();

export function setConfig(newConfig = {}) {
    config = { ...config, ...newConfig };
    initPaths();
}

function initPaths() {
    const distStatic = join(ROOT_FOLDER, config.distStaticFolder);
    const tmpBundle = join(config.tmpFolder, config.bundleFolder);
    const src = join(ROOT_FOLDER, config.srcFolder);
    const distServer = join(ROOT_FOLDER, config.distServerFolder);
    paths = {
        tmpBundle,
        distStatic,
        src,
        distServer,
        distServerApi: join(distServer, config.apiFolder),
        tmpPages: join(config.tmpFolder, config.pagesFolder),
        srcPages: join(src, config.pagesFolder),
        srcApi: join(src, config.apiFolder),
        assets: join(distStatic, config.assetsFolder),
        rkaImport: join(tmpBundle, RKA_IMPORT_FILE),
        tmpBundleEntry: join(paths.tmpBundle, 'index.js'),
    };
}

export function setDev() {
    DEV = true;
    // ToDo: set some type for typescript
    (global as any).DEV = DEV;
}
