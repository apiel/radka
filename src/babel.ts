import { ensureFileSync, readFileSync, outputFileSync } from 'fs-extra';
import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { join } from 'path';

import { bundlePath } from './config';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

export default function() {
    return {
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
                    path.replaceWith(path.node.declaration);
                }
            },
            ExportNamedDeclaration(
                path: NodePath<t.ExportNamedDeclaration>,
                state: any,
            ) {
                if (state.filename.endsWith('.script.js')) {
                    path.replaceWith(path.node.declaration);
                }
            },
        },
    };
}

function addImportToBundle(path: NodePath<t.ImportDeclaration>) {
    // should be only if import is not a local lib
    const importFile = join(bundlePath, '.import.js');
    ensureFileSync(importFile);
    const code = readFileSync(importFile).toString();
    const ast = parse(code);
    ast.program.body.push(path.node);

    const output = generate(ast, { /* options */ }, code);
    outputFileSync(importFile, output.code);
}
