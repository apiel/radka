"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const tmp_1 = require("tmp");
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
    baseUrl: '',
    tmpFolder: process.env.TEMP_FOLDER || tmp_1.dirSync().name,
    turbolinks: 'true',
};
exports.distStaticPath = '';
exports.distServerPath = '';
exports.srcPath = '';
exports.pagesPath = '';
exports.bundlePath = '';
initPath();
function setConfig(newConfig = {}) {
    exports.config = Object.assign({}, exports.config, newConfig);
    initPath();
}
exports.setConfig = setConfig;
function initPath() {
    exports.distStaticPath = path_1.join(exports.ROOT_FOLDER, exports.config.distStaticFolder);
    exports.distServerPath = path_1.join(exports.ROOT_FOLDER, exports.config.distServerFolder);
    exports.srcPath = path_1.join(exports.ROOT_FOLDER, exports.config.srcFolder);
    exports.pagesPath = path_1.join(exports.config.tmpFolder, exports.config.pagesFolder);
    exports.bundlePath = path_1.join(exports.config.tmpFolder, exports.config.bundleFolder);
}
//# sourceMappingURL=config.js.map