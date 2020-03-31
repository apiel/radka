"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_pragmatic_1 = require("jsx-pragmatic");
const fs_extra_1 = require("fs-extra");
var jsx_pragmatic_2 = require("jsx-pragmatic");
exports.Fragment = jsx_pragmatic_2.Fragment;
exports.jsx = (...params) => {
    return jsx_pragmatic_1.node(...params);
};
let linkIdSeq = 0;
function page(component, propsList) {
    const linkId = `page-${linkIdSeq++}`;
    return {
        propsList,
        component,
        linkId,
        link: (props) => `%link%${linkId}%${serialize(props)}%`,
    };
}
exports.page = page;
function serialize(props) {
    if (props) {
        return Object.keys(props)
            .map(k => `${k}=${props[k]}`)
            .join(';');
    }
    return '';
}
function Import({ src }) {
    const source = fs_extra_1.readFileSync(src).toString();
    return jsx_pragmatic_1.node('script', { innerHTML: `if (!window.r_ka) window.r_ka = []; window.r_ka.push(function () { ${source} });` });
}
exports.Import = Import;
//# sourceMappingURL=lib.js.map