"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_pragmatic_1 = require("jsx-pragmatic");
exports.jsx = jsx_pragmatic_1.node;
let linkId = 0;
function page(component) {
    return {
        component,
        linkId: `page-${linkId++}`,
    };
}
exports.page = page;
//# sourceMappingURL=lib.js.map