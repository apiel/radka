import { server as isomorServer } from 'isomor-server';

import { paths } from './config';

export function server(skipTimeout = false) {
    process.env = {
        ...process.env,
        ISOMOR_STATIC_FOLDER: paths.distStatic,
        ISOMOR_SERVER_FOLDER: paths.distServer,
        ...(skipTimeout && { ISOMOR_WS_TIMEOUT: '0' }),
    };
    return isomorServer();
}
