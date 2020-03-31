export { Fragment } from 'jsx-pragmatic';
export declare const jsx: (...params: any[]) => any;
export declare type LinkProps = {
    [key: string]: string | number;
};
export declare type Props = {
    [key: string]: any;
};
declare type PropsList = Props[] | undefined;
export interface Page {
    propsList: PropsList;
    component: Function;
    linkId: string;
    link: (props?: LinkProps) => string;
}
export declare function page(component: Function, propsList?: PropsList): Page;
export declare function Import({ src }: {
    src: string;
}): any;
