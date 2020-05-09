import * as ParcelBundler from 'parcel-bundler';
export declare function build(): Promise<void>;
export declare function injectBaseCodeToBundle(): Promise<void>;
export declare function copyApiToServer(): Promise<void>;
export declare function runBabel(): Promise<number>;
export declare function getParcel(newBundler?: boolean): ParcelBundler;
export declare function runParcel(): Promise<void>;
export declare function runIsomor(): Promise<number>;
