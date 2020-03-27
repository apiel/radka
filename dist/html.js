"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_pragmatic_1 = require("jsx-pragmatic");
const ELEMENT_PROP = {
    INNER_HTML: 'innerHTML'
};
const SELF_CLOSING_TAGS = {
    br: true
};
function htmlEncode(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}
function propsToHTML(props) {
    const keys = Object.keys(props).filter(key => {
        const val = props[key];
        if (key === ELEMENT_PROP.INNER_HTML) {
            return false;
        }
        if (!val) {
            return false;
        }
        if (typeof val === 'string' || typeof val === 'number' || val === true) {
            return true;
        }
        return false;
    });
    if (!keys.length) {
        return '';
    }
    const pairs = keys.map(key => {
        const val = props[key];
        if (val === true) {
            return `${htmlEncode(key)}`;
        }
        if (typeof val !== 'string' && typeof val !== 'number') {
            throw new TypeError(`Unexpected prop type: ${typeof val}`);
        }
        return `${htmlEncode(key)}="${htmlEncode(val.toString())}"`;
    });
    return ` ${pairs.join(' ')}`;
}
function html(opts = {}) {
    const { transform } = opts;
    const htmlRenderer = (node) => {
        if (transform) {
            node = transform(node);
        }
        if (node.type === jsx_pragmatic_1.NODE_TYPE.COMPONENT) {
            return [].concat(node.renderComponent(htmlRenderer)).join('');
        }
        if (node.type === jsx_pragmatic_1.NODE_TYPE.ELEMENT) {
            const renderedProps = propsToHTML(node.props);
            if (SELF_CLOSING_TAGS[node.name]) {
                return `<${node.name}${renderedProps} />`;
            }
            else {
                const renderedChildren = (typeof node.props[ELEMENT_PROP.INNER_HTML] === 'string')
                    ? node.props[ELEMENT_PROP.INNER_HTML]
                    : node.renderChildren(htmlRenderer).join('');
                return `<${node.name}${renderedProps}>${renderedChildren}</${node.name}>`;
            }
        }
        if (node.type === jsx_pragmatic_1.NODE_TYPE.TEXT) {
            return htmlEncode(node.text);
        }
        throw new TypeError(`Unhandleable node: ${node.type}`);
    };
    return htmlRenderer;
}
exports.html = html;
//# sourceMappingURL=html.js.map