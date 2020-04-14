import { server as isomorServer } from 'isomor-server';

import { paths, config } from './config';

export function server() {
    process.env = {
        ...process.env,
        ISOMOR_STATIC_FOLDER: paths.distStatic,
        ISOMOR_DIST_SERVER_FOLDER: paths.distServer,
        ISOMOR_SERVER_FOLDER: config.apiFolder,
    };
    return isomorServer();
}
