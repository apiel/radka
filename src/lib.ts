import { node, html } from 'jsx-pragmatic';

export const jsx = node;

let linkId = 0;

// need to improve types
export function page(component: string | Function) {
    return {
        component,
        linkId: `page-${linkId++}`,
    }
}
