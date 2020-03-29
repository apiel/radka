import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export default function() {
    return {
        visitor: {
            ImportDeclaration(path: NodePath, state: any) {
                if (state.filename.endsWith('.script.js')) {
                    path.remove();
                    // then we should save those path to add import in bundle
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
