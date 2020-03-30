import { ensureFileSync, readFileSync, outputFileSync } from 'fs-extra';
import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { ExportSpecifier } from '@babel/types';
import { join } from 'path';

import { bundlePath } from './config';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

export default function() {
    return {
        // node_modules/@babel/core/lib/config/full.js:199
        // pre: () => console.log('pre'),
        // post: () => console.log('post'),
        visitor: {
            ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: any) {
                if (state.filename.endsWith('.script.js')) {
                    addImportToBundle(path);
                    path.remove();
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
        },
    };
}

// should it go in the bundle only if it has been imported?
function addImportToBundle(path: NodePath<t.ImportDeclaration>) {
    // console.log('ImportDeclaration', JsonAst(path.node));
    // // should be only if import is not a local lib
    const importFile = join(bundlePath, '.import.js');
    ensureFileSync(importFile);
    const code = readFileSync(importFile).toString();
    const ast = parse(code, {
        sourceType: 'module',
    });

    path = convertImportToExport(path);

    ast.program.body.push(path.node);
    const output = generate(ast, {}, code);
    outputFileSync(importFile, output.code);
}

// we could remove duplicate import
function convertImportToExport(
    path: NodePath<t.ImportDeclaration | t.ExportNamedDeclaration>,
) {
    path.node.type = t.exportNamedDeclaration().type;
    path.node.specifiers.forEach((specifier: any) => {
        specifier.type =
            specifier.type === 'ImportSpecifier'
                ? 'ExportSpecifier'
                : 'ExportNamespaceSpecifier';
    });
    return path as any;
}

// for debugging in console.log
export function JsonAst(node: any) {
    const skip = ['loc', 'range', 'start', 'end'];
    const replacer = (key: string, value: any) =>
        skip.includes(key) ? undefined : value;
    return JSON.stringify(node, replacer, 4);
}
