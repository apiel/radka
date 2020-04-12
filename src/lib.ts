import { node } from 'jsx-pragmatic';
import { readFileSync } from 'fs-extra';
import * as md5 from 'md5';
import { extname } from 'path';

export { Fragment } from 'jsx-pragmatic';

export const jsx = {
    render: node,
    require: (dir: string, href: string) => {
        if (isAssetFilename(href)) {
            console.log('assssssset', { dir, href });
            return 'myasset.jpg';
        } else {
            return require(href);
        }
    },
};

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
            .map((k) => `${k}=${props[k]}`)
            .join(';');
    }
    return '';
}

export function Import({ src }: { src: string }) {
    const source = readFileSync(src).toString();
    return node('script', { innerHTML: rkaLoader(md5(src), source) });
}

export function rkaLoader(id: string, source: string) {
    return `if (!window.r_ka) window.r_ka = {}; window.r_ka["${id}"] = function () { ${source} };`;
}

export function isAssetFilename(href: string) {
    return ['.png', '.jpg', '.gif'].includes(extname(href));
}
