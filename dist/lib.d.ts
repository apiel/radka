export declare const jsx: any;
export declare type Props = {
    [key: string]: any;
};
declare type PropsList = Props[] | undefined;
export interface Page {
    propsList: PropsList;
    component: Function;
    linkId: string;
}
export declare function page(component: Function, propsList?: PropsList): Page;
export {};
