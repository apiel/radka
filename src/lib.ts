import { node, html } from 'jsx-pragmatic';

export const jsx = node;

let linkId = 0;

export type Props = {
    [key: string]: any;
};

type PropsList = Props[] | undefined;

export interface Page {
    propsList: PropsList;
    component: Function;
    linkId: string;
}

// need to improve types
export function page(
    component: Function,
    propsList?: PropsList,
): Page {
    return {
        propsList,
        component,
        linkId: `page-${linkId++}`,
    };
}
