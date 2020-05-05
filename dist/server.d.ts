/// <reference types="node" />
export declare function server(skipTimeout?: boolean): Promise<{
    app: any;
    server: import("http").Server;
}>;
