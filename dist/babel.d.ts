import { NodePath } from '@babel/core';
import * as t from '@babel/types';
export default function (): {
    visitor: {
        ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: any): void;
        ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>, state: any): void;
        ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>, state: any): void;
        CallExpression(path: NodePath<t.CallExpression>, state: any): void;
    };
};
export declare function JsonAst(node: any): string;
