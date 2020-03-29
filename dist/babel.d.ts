import { NodePath } from '@babel/core';
import * as t from '@babel/types';
export default function (): {
    visitor: {
        ImportDeclaration(path: NodePath<t.Node>, state: any): void;
        ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>, state: any): void;
        ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>, state: any): void;
    };
};