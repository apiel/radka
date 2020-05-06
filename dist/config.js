"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const tmp_1 = require("tmp");
exports.DEV = false;
exports.ASSETS_EXT = ['.png', '.jpg', '.gif', '.otf', '.ttc', '.ttf', '.pdf', '.ico'];
exports.RKA_IMPORT_FILE = 'r_ka-import.js';
exports.CONFIG_FILE = 'radka.config';
exports.ROOT_FOLDER = process.env.ROOT_FOLDER
    ? path_1.resolve(process.env.ROOT_FOLDER)
    : process.cwd();
exports.config = {
    srcFolder: 'src',
    distStaticFolder: path_1.join('site', 'static'),
    distServerFolder: path_1.join('site', 'server'),
    apiFolder: 'api',
    pagesFolder: 'pages',
    pagesSuffix: '.page',
    bundleFolder: 'bundle',
    assetsFolder: 'r-ka-assets',
    baseUrl: '',
    tmpFolder: process.env.TEMP_FOLDER || tmp_1.dirSync().name,
    turbolinks: 'true',
};
exports.paths = {
    distStatic: '',
    distServer: '',
    distServerApi: '',
    src: '',
    tmpPages: '',
    srcPages: '',
    srcApi: '',
    bundle: '',
    assets: '',
    rkaImport: '',
};
initPaths();
function setConfig(newConfig = {}) {
    exports.config = Object.assign(Object.assign({}, exports.config), newConfig);
    initPaths();
}
exports.setConfig = setConfig;
function initPaths() {
    const distStatic = path_1.join(exports.ROOT_FOLDER, exports.config.distStaticFolder);
    const bundle = path_1.join(exports.config.tmpFolder, exports.config.bundleFolder);
    const src = path_1.join(exports.ROOT_FOLDER, exports.config.srcFolder);
    const distServer = path_1.join(exports.ROOT_FOLDER, exports.config.distServerFolder);
    exports.paths = {
        bundle,
        distStatic,
        src,
        distServer,
        distServerApi: path_1.join(distServer, exports.config.apiFolder),
        tmpPages: path_1.join(exports.config.tmpFolder, exports.config.pagesFolder),
        srcPages: path_1.join(src, exports.config.pagesFolder),
        srcApi: path_1.join(src, exports.config.apiFolder),
        assets: path_1.join(distStatic, exports.config.assetsFolder),
        rkaImport: path_1.join(bundle, exports.RKA_IMPORT_FILE),
    };
}
function setDev() {
    exports.DEV = true;
    global.DEV = exports.DEV;
}
exports.setDev = setDev;
exports.getBundleFile = () => path_1.join(exports.paths.bundle, 'index.js');
//# sourceMappingURL=config.js.map