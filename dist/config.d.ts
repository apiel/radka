export declare const CONFIG_FILE = "radka.config";
export declare const ROOT_FOLDER: string;
export declare let config: {
    srcFolder: string;
    distFolder: string;
    pagesFolder: string;
    pagesSuffix: string;
    bundleFolder: string;
    tmpFolder: string;
};
export declare let distPath: string;
export declare let srcPath: string;
export declare let pagesPath: string;
export declare let bundlePath: string;
export declare function setConfig(newConfig?: {}): void;
