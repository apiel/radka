import { node } from 'jsx-pragmatic';
import { readFileSync } from 'fs-extra';

export { Fragment } from 'jsx-pragmatic';
export const jsx = node;

let linkIdSeq = 0;

export type LinkProps = {
    [key: string]: string | number;
};

export type Props = {
    [key: string]: any;
};

type PropsList = Props[] | undefined;

export interface Page {
    propsList: PropsList;
    component: Function;
    linkId: string;
    link: (props?: LinkProps) => string;
}

// ToDo: need to improve types
export function page(component: Function, propsList?: PropsList): Page {
    const linkId = `page-${linkIdSeq++}`;
    return {
        propsList,
        component,
        linkId,
        link: (props?: LinkProps) => `%link%${linkId}%${serialize(props)}%`,
    };
}

function serialize(props?: LinkProps) {
    if (props) {
        // ToDo: should we remove % from value
        // we would anyway need a central place to generate url values
        // for the applyPropsToHtmlPath in compile.ts
        return Object.keys(props)
            .map(k => `${k}=${props[k]}`)
            .join(';');
    }
    return '';
}

export function Import({ src }: { src: string }) {
    const source = readFileSync(src).toString();
    // ToDo: should we only have the window.r_ka.push if source contain require?
    // if (!source.includes('require')) return node('script', { innerHTML: source });
    return node('script', { innerHTML: `if (!window.r_ka) window.r_ka = []; window.r_ka.push(function () { ${source} });` });
}
