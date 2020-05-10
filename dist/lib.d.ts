export { Fragment } from 'jsx-pragmatic';
export declare const jsx: {
    render: any;
    require: (dir: string, href: string) => any;
};
export declare type LinkProps = {
    [key: string]: string | number;
};
export declare type Props = {
    [key: string]: any;
};
declare type PropsList = Props[] | undefined;
export interface GetterPropsList {
    propsList: PropsList;
    next?: GetPropsList;
}
export declare type GetPropsList = () => GetterPropsList;
export interface Page {
    getPropsList: GetPropsList;
    component: Function;
    linkId: string;
    link: (props?: LinkProps) => string;
    setPaths: (values: any) => void;
}
export declare function page(component: Function, propsList?: GetPropsList | PropsList, linkId?: string): Page;
export declare function Import({ src }: {
    src: string;
}): any;
export declare function rkaLoader(id: string, source: string): string;
export declare function isAssetFilename(href: string): boolean;
