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
    baseUrl: string;
    tmpFolder: string;
    turbolinks: string;
};
export declare let distStaticPath: string;
export declare let distServerPath: string;
export declare let srcPath: string;
export declare let pagesPath: string;
export declare let bundlePath: string;
export declare function setConfig(newConfig?: {}): void;
