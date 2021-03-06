"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isomor_server_1 = require("isomor-server");
const config_1 = require("./config");
function server(skipTimeout = false) {
    process.env = Object.assign(Object.assign(Object.assign({}, process.env), { ISOMOR_STATIC_FOLDER: config_1.paths.distStatic, ISOMOR_SERVER_FOLDER: config_1.paths.distServer }), (skipTimeout && { ISOMOR_WS_TIMEOUT: '0' }));
    return isomor_server_1.server();
}
exports.server = server;
//# sourceMappingURL=server.js.map