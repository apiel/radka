"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    path.remove();
                }
            },
            ExportDefaultDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    path.replaceWith(path.node.declaration);
                }
            },
            ExportNamedDeclaration(path, state) {
                if (state.filename.endsWith('.script.js')) {
                    path.replaceWith(path.node.declaration);
                }
            },
        },
    };
}
exports.default = default_1;
//# sourceMappingURL=babel.js.map