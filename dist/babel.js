"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = require("./config");
const parser_1 = require("@babel/parser");
const generator_1 = require("@babel/generator");
const lib_1 = require("./lib");
function default_1() {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    addImportToBundle(path);
                }
                else if (state.filename.endsWith(`.jsx`) &&
                    !path.node.specifiers.length) {
                    if (path.node.source.value.endsWith('.script') ||
                        path.node.source.value.endsWith('.script.js')) {
                        let importPath = path.node.source.value;
                        const ext = path_1.extname(importPath) === '.js' ? '' : '.js';
                        pushImportFile(path, state, `${importPath}${ext}`);
                    }
                    else if (path.node.source.value.endsWith('.css')) {
                        let importPath = path.node.source.value;
                        pushImportFile(path, state, importPath);
                    }
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
            CallExpression(path, state) {
                if (path.node.callee.type === 'Identifier' &&
                    path.node.callee.name === 'require') {
                    handleRequire(path, state);
                }
            },
        },
    };
}
exports.default = default_1;
function handleRequire(path, state) {
    if (path.node.arguments[0].type !== 'StringLiteral' ||
        lib_1.isAssetFilename(path.node.arguments[0].value)) {
        const href = generator_1.default(path.node.arguments[0], {}, '').code;
        const ast = parser_1.parse(`jsx.require('${path_1.dirname(state.filename)}', ${href});`);
        path.replaceWithMultiple(ast.program.body);
    }
}
function pushImportFile(path, state, importPath) {
    const file = path_1.join(path_1.dirname(state.filename), importPath);
    const ast = parser_1.parse(`global.r_ka_imports = [...(global.r_ka_imports || []), '${file}'];`);
    path.replaceWithMultiple(ast.program.body);
}
function addImportToBundle(path) {
    const emptyCode = '';
    const ast = parser_1.parse(emptyCode);
    ast.program.body.push(path.node);
    const output = generator_1.default(ast, {}, emptyCode);
    const rkaImportFile = path_1.join(config_1.paths.bundle, config_1.RKA_IMPORT_FILE);
    fs_extra_1.ensureFileSync(rkaImportFile);
    fs_1.appendFileSync(rkaImportFile, output.code + '\n');
}
function JsonAst(node) {
    const skip = ['loc', 'range', 'start', 'end'];
    const replacer = (key, value) => skip.includes(key) ? undefined : value;
    return JSON.stringify(node, replacer, 4);
}
exports.JsonAst = JsonAst;
//# sourceMappingURL=babel.js.map