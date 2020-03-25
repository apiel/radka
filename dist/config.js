"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const tmp_1 = require("tmp");
exports.CONFIG_FILE = 'radka.config';
exports.ROOT_FOLDER = process.env.ROOT_FOLDER
    ? path_1.resolve(process.env.ROOT_FOLDER)
    : process.cwd();
exports.config = {
    srcFolder: 'src',
    distFolder: 'site',
    pagesFolder: 'pages',
    tmpFolder: tmp_1.dirSync().name,
};
exports.distPath = path_1.join(exports.ROOT_FOLDER, exports.config.distFolder);
exports.srcPath = path_1.join(exports.ROOT_FOLDER, exports.config.srcFolder);
function setConfig(newConfig = {}) {
    exports.config = Object.assign(Object.assign({}, exports.config), newConfig);
    exports.distPath = path_1.join(exports.ROOT_FOLDER, exports.config.distFolder);
    exports.srcPath = path_1.join(exports.ROOT_FOLDER, exports.config.srcFolder);
}
exports.setConfig = setConfig;
//# sourceMappingURL=config.js.map