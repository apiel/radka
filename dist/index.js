#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logol_1 = require("logol");
const minimist = require("minimist");
const cosmiconfig_1 = require("cosmiconfig");
const config_1 = require("./config");
const compile_1 = require("./compile");
const dev_1 = require("./dev");
const server_1 = require("./server");
const cosmiconfigOptions = {
    searchPlaces: [
        'package.json',
        `${config_1.CONFIG_FILE}.json`,
        `${config_1.CONFIG_FILE}.yaml`,
        `${config_1.CONFIG_FILE}.yml`,
        `${config_1.CONFIG_FILE}.js`,
    ],
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const _a = minimist(process.argv.slice(2)), { configFile, _, rebuild } = _a, config = __rest(_a, ["configFile", "_", "rebuild"]);
        if (config.help || config.h) {
            console.log(`Usage: radka [dev|server|build]

Options:
  --configFile=./config.json
${Object.keys(config_1.config)
                .map((k) => `  --${k}=${config_1.config[k]}\n`)
                .join('')}
`);
        }
        else {
            logol_1.info('Start Radka');
            const cosmic = configFile
                ? yield cosmiconfig_1.cosmiconfig(config_1.CONFIG_FILE).load(configFile)
                : yield cosmiconfig_1.cosmiconfig(config_1.CONFIG_FILE, cosmiconfigOptions).search();
            config_1.setConfig(cosmic && cosmic.config);
            config_1.setConfig(config);
            logol_1.info('Config', config_1.config);
            if (_.includes('dev')) {
                yield dev_1.dev(rebuild);
            }
            else if (_.includes('server')) {
                yield server_1.server();
            }
            else {
                yield compile_1.build();
            }
        }
    });
}
run();
//# sourceMappingURL=index.js.map