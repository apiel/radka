"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_pragmatic_1 = require("jsx-pragmatic");
const fs_extra_1 = require("fs-extra");
const md5 = require("md5");
const path_1 = require("path");
const urlJoin = require('url-join');
const config_1 = require("./config");
var jsx_pragmatic_2 = require("jsx-pragmatic");
exports.Fragment = jsx_pragmatic_2.Fragment;
let paths = config_1.paths;
exports.jsx = {
    render: jsx_pragmatic_1.node,
    require: (dir, href) => {
        if (isAssetFilename(href)) {
            const srcImgPath = path_1.join(dir, href);
            const filename = srcImgPath
                .substr(paths.src.length)
                .split(path_1.sep)
                .filter((p) => p)
                .join('-');
            const distImgPath = path_1.join(paths.assets, filename);
            const url = urlJoin(paths.assets.substr(paths.distStatic.length), filename);
            fs_extra_1.copySync(srcImgPath, distImgPath);
            return url;
        }
        else {
            return require(href);
        }
    },
};
let linkIdSeq = 0;
function page(component, propsList, linkId = `page-${linkIdSeq++}`) {
    return {
        getPropsList: Array.isArray(propsList)
            ? () => ({ propsList })
            : propsList,
        component,
        linkId,
        link: (props) => `%link%${linkId}%${serialize(props)}%`,
        setPaths: (values = config_1.paths) => {
            paths = values;
        },
    };
}
exports.page = page;
function serialize(props) {
    if (props) {
        return Object.keys(props)
            .map((k) => `${k}=${props[k]}`)
            .join(';');
    }
    return '';
}
function Import({ src }) {
    const source = fs_extra_1.readFileSync(src).toString();
    return jsx_pragmatic_1.node('script', { innerHTML: rkaLoader(md5(src), source) });
}
exports.Import = Import;
function rkaLoader(id, source) {
    return `if (!window.r_ka) window.r_ka = {}; window.r_ka["${id}"] = function () { ${source} };`;
}
exports.rkaLoader = rkaLoader;
function isAssetFilename(href) {
    return config_1.ASSETS_EXT.includes(path_1.extname(href));
}
exports.isAssetFilename = isAssetFilename;
//# sourceMappingURL=lib.js.map