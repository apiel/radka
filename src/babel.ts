import { ensureFileSync } from 'fs-extra';
import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { join, dirname, extname } from 'path';
import { appendFileSync } from 'fs';

import { bundlePath, RKA_IMPORT_FILE } from './config';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import { isAssetFilename } from './lib';

export default function () {
    return {
        // node_modules/@babel/core/lib/config/full.js:199
        // pre: () => console.log('pre'),
        // post: () => console.log('post'),
        visitor: {
            ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: any) {
                if (state.filename.endsWith('.script.js')) {
                    addImportToBundle(path);
                    // ToDo: how to handle local import ./something // path.remove(); ?
                } else if (
                    state.filename.endsWith(`.jsx`) &&
                    !path.node.specifiers.length
                ) {
                    if (
                        path.node.source.value.endsWith('.script') ||
                        path.node.source.value.endsWith('.script.js')
                    ) {
                        let importPath = path.node.source.value;
                        const ext = extname(importPath) === '.js' ? '' : '.js';
                        pushImportFile(path, state, `${importPath}${ext}`);
                    } else if (path.node.source.value.endsWith('.css')) {
                        let importPath = path.node.source.value;
                        pushImportFile(path, state, importPath);
                    }
                }
            },
            ExportDefaultDeclaration(
                path: NodePath<t.ExportDefaultDeclaration>,
                state: any,
            ) {
                if (state.filename.endsWith('.script.js')) {
                    if (path.node.declaration) {
                        path.replaceWith(path.node.declaration);
                    } else {
                        path.remove();
                    }
                }
            },
            ExportNamedDeclaration(
                path: NodePath<t.ExportNamedDeclaration>,
                state: any,
            ) {
                // !path.node.declaration &&
                //     console.log('ExportNamedDeclaration', JsonAst(path.node));
                if (state.filename.endsWith('.script.js')) {
                    if (path.node.declaration) {
                        path.replaceWith(path.node.declaration);
                    } else {
                        path.remove();
                    }
                }
            },
            CallExpression(path: NodePath<t.CallExpression>, state: any) {
                if (
                    path.node.callee.type === 'Identifier' &&
                    path.node.callee.name === 'require'
                ) {
                    handleRequire(path, state);
                }
            },
        },
    };
}

function handleRequire(path: NodePath<t.CallExpression>, state: any) {
    if (
        path.node.arguments[0].type !== 'StringLiteral' ||
        isAssetFilename((path.node.arguments[0] as t.StringLiteral).value)
    ) {
        const href = generate(path.node.arguments[0], {}, '').code;
        const ast = parse(
            `jsx.require('${dirname(state.filename)}', ${href});`,
        );
        path.replaceWithMultiple(ast.program.body);
    }
}

function pushImportFile(
    path: NodePath<t.ImportDeclaration>,
    state: any,
    importPath: string,
) {
    const file = join(dirname(state.filename), importPath);
    const ast = parse(
        `global.r_ka_imports = [...(global.r_ka_imports || []), '${file}'];`,
    );
    path.replaceWithMultiple(ast.program.body);
}

// should it go in the bundle only if it has been imported?
function addImportToBundle(path: NodePath<t.ImportDeclaration>) {
    // console.log('ImportDeclaration', JsonAst(path.node));
    const emptyCode = '';
    const ast = parse(emptyCode);
    ast.program.body.push(path.node);
    const output = generate(ast, {}, emptyCode);

    const rkaImportFile = join(bundlePath, RKA_IMPORT_FILE);
    ensureFileSync(rkaImportFile);
    appendFileSync(rkaImportFile, output.code + '\n');
}

// for debugging in console.log
export function JsonAst(node: any) {
    const skip = ['loc', 'range', 'start', 'end'];
    const replacer = (key: string, value: any) =>
        skip.includes(key) ? undefined : value;
    return JSON.stringify(node, replacer, 4);
}
