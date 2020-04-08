export declare const CONFIG_FILE = "radka.config";
export declare const ROOT_FOLDER: string;
export declare let config: {
    srcFolder: string;
    distStaticFolder: string;
    distApiFolder: string;
    apiFolder: string;
    pagesFolder: string;
    pagesSuffix: string;
    bundleFolder: string;
    baseUrl: string;
    tmpFolder: string;
};
export declare let distStaticPath: string;
export declare let distApiPath: string;
export declare let srcPath: string;
export declare let pagesPath: string;
export declare let bundlePath: string;
export declare function setConfig(newConfig?: {}): void;
