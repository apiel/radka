"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const tmp_1 = require("tmp");
exports.ASSETS_EXT = ['.png', '.jpg', '.gif', '.otf', '.ttc', '.ttf', '.pdf'];
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
    src: '',
    pages: '',
    bundle: '',
    assets: '',
};
initPaths();
function setConfig(newConfig = {}) {
    exports.config = Object.assign({}, exports.config, newConfig);
    initPaths();
}
exports.setConfig = setConfig;
function initPaths() {
    const distStatic = path_1.join(exports.ROOT_FOLDER, exports.config.distStaticFolder);
    exports.paths = {
        distStatic,
        distServer: path_1.join(exports.ROOT_FOLDER, exports.config.distServerFolder),
        src: path_1.join(exports.ROOT_FOLDER, exports.config.srcFolder),
        pages: path_1.join(exports.config.tmpFolder, exports.config.pagesFolder),
        bundle: path_1.join(exports.config.tmpFolder, exports.config.bundleFolder),
        assets: path_1.join(distStatic, exports.config.assetsFolder),
    };
}
//# sourceMappingURL=config.js.map