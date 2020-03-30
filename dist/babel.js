"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const t = require("@babel/types");
const path_1 = require("path");
const config_1 = require("./config");
const parser_1 = require("@babel/parser");
const generator_1 = require("@babel/generator");
function default_1() {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    addImportToBundle(path);
                    path.remove();
                }
            },
            ExportDefaultDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    if (path.node.declaration) {
                        path.replaceWith(path.node.declaration);
                    }
                    else {
                        path.remove();
                    }
                }
            },
            ExportNamedDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    if (path.node.declaration) {
                        path.replaceWith(path.node.declaration);
                    }
                    else {
                        path.remove();
                    }
                }
            },
        },
    };
}
exports.default = default_1;
function addImportToBundle(path) {
    const importFile = path_1.join(config_1.bundlePath, '.import.js');
    fs_extra_1.ensureFileSync(importFile);
    const code = fs_extra_1.readFileSync(importFile).toString();
    const ast = parser_1.parse(code);
    path = convertImportToExport(path);
    ast.program.body.push(path.node);
    const output = generator_1.default(ast, {}, code);
    fs_extra_1.outputFileSync(importFile, output.code);
}
function convertImportToExport(path) {
    path.node.type = t.exportNamedDeclaration().type;
    path.node.specifiers.forEach((specifier) => {
        specifier.type =
            specifier.type === 'ImportSpecifier'
                ? 'ExportSpecifier'
                : 'ExportNamespaceSpecifier';
    });
    return path;
}
function JsonAst(node) {
    const skip = ['loc', 'range', 'start', 'end'];
    const replacer = (key, value) => skip.includes(key) ? undefined : value;
    return JSON.stringify(node, replacer, 4);
}
exports.JsonAst = JsonAst;
//# sourceMappingURL=babel.js.map