export declare const ASSETS_EXT: string[];
export declare const RKA_IMPORT_FILE = "r_ka-import.js";
export declare const CONFIG_FILE = "radka.config";
export declare const ROOT_FOLDER: string;
export declare let config: {
    srcFolder: string;
    distStaticFolder: string;
    distServerFolder: string;
    apiFolder: string;
    pagesFolder: string;
    pagesSuffix: string;
    bundleFolder: string;
    assetsFolder: string;
    baseUrl: string;
    tmpFolder: string;
    turbolinks: string;
};
export declare let paths: {
    distStatic: string;
    distServer: string;
    src: string;
    pages: string;
    bundle: string;
    assets: string;
};
export declare function setConfig(newConfig?: {}): void;
