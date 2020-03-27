"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_pragmatic_1 = require("jsx-pragmatic");
exports.jsx = jsx_pragmatic_1.node;
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
        return Object.keys(props).map((k) => `${k}=${props[k]}`).join(';');
    }
    return '';
}
//# sourceMappingURL=lib.js.map