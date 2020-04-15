/// <reference types="node" />
export declare function server(skipTimeout?: boolean): Promise<{
    app: import("express").Express;
    server: import("http").Server;
}>;
