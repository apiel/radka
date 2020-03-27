"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transform(node) {
    node = transformEvent(node);
    return node;
}
exports.transform = transform;
function transformEvent(node) {
    const { props } = node;
    if (props) {
        for (const prop of Object.keys(props)) {
            const val = props[prop];
            if (prop.match(/^on[A-Z][a-z]/) && typeof val === 'function') {
                console.log('Event', prop, val.name, val.stack);
            }
        }
    }
    return node;
}
//# sourceMappingURL=transform.js.map