import { node } from 'jsx-pragmatic';
import { readFileSync, copySync } from 'fs-extra';
import * as md5 from 'md5';
import { extname, join, sep } from 'path';
// import urlJoin from 'url-join';
const urlJoin = require('url-join');

import { ASSETS_EXT, paths as pathsDefault } from './config';

export { Fragment } from 'jsx-pragmatic';

let paths = pathsDefault;

export const jsx = {
    render: node,
    require: (dir: string, href: string) => {
        if (isAssetFilename(href)) {
            const srcImgPath = join(dir, href);
            const filename = srcImgPath
                .substr(paths.src.length)
                .split(sep)
                .filter((p) => p)
                .join('-');
            const distImgPath = join(paths.assets, filename);
            // could use config.assetsFolder instead of substr but then need to pass in params
            const url = urlJoin(
                paths.assets.substr(paths.distStatic.length),
                filename,
            );
            // should we copy only if file does not exist?
            copySync(srcImgPath, distImgPath);
            return url;
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

export interface GetterPropsList {
    propsList: PropsList;
    next?: GetPropsList;
}

export type GetPropsList = () => GetterPropsList;

export interface Page {
    getPropsList: GetPropsList;
    component: Function;
    linkId: string;
    link: (props?: LinkProps) => string;
    setPaths: (values: any) => void;
}

// ToDo: need to improve types
export function page(
    component: Function,
    propsList?: GetPropsList | PropsList,
    linkId = `page-${linkIdSeq++}`,
): Page {
    return {
        getPropsList: Array.isArray(propsList)
            ? () => ({ propsList })
            : propsList,
        component,
        linkId,
        link: (props?: LinkProps) => `%link%${linkId}%${serialize(props)}%`,
        setPaths: (values = pathsDefault) => {
            paths = values;
        },
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
    return ASSETS_EXT.includes(extname(href));
}
