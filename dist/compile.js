"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spawn = require("cross-spawn");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const logol_1 = require("logol");
const chalk_1 = require("chalk");
const config_1 = require("./config");
const generatePages_1 = require("./generatePages");
const lib_1 = require("./lib");
function compile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.remove(config_1.paths.distStatic);
        yield fs_extra_1.remove(config_1.config.tmpFolder);
        yield runBabel();
        yield injectBaseCodeToBundle();
        yield copyApiToServer();
        yield runIsomor();
        yield runParcel();
        yield generatePages_1.generatePages();
    });
}
exports.compile = compile;
function read(file) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.ensureFile(file);
        const content = yield fs_extra_1.readFile(file);
        return content.toString();
    });
}
function injectBaseCodeToBundle() {
    return __awaiter(this, void 0, void 0, function* () {
        const bundleFile = path_1.join(config_1.paths.bundle, 'index.js');
        const codes = [
            lib_1.rkaLoader('r_ka_bundle', yield read(bundleFile)),
            yield read(path_1.join(config_1.paths.bundle, config_1.RKA_IMPORT_FILE)),
            'window.require = require;',
            'require("@babel/polyfill");',
        ];
        if (config_1.config.turbolinks === 'true') {
            codes.push('if(!window.tb_link){require("turbolinks").start();window.tb_link=1;};');
            codes.push('if (window.r_ka_last !== window.location.href) { window.r_ka_last=window.location.href; Object.keys(window.r_ka || {}).forEach(function(k) { window.r_ka[k](); }); };');
            codes.push('window.r_ka={};');
        }
        else {
            codes.push('Object.keys(window.r_ka || {}).forEach(function(k) { window.r_ka[k](); });');
        }
        yield fs_extra_1.writeFile(bundleFile, codes.join(';'));
    });
}
function copyApiToServer() {
    return fs_extra_1.copy(path_1.join(config_1.paths.src, config_1.config.apiFolder), path_1.join(config_1.paths.distServer, config_1.config.apiFolder));
}
function runBabel() {
    logol_1.info('Run babel');
    return shell('babel', `${config_1.paths.src} --out-dir ${config_1.config.tmpFolder} --copy-files`.split(' '));
}
function runParcel() {
    logol_1.info('Run parcel');
    fs_extra_1.ensureFileSync(path_1.join(config_1.paths.distStatic, 'index.css'));
    return shell('parcel', `build ${path_1.join(config_1.paths.bundle, 'index.js')} --out-dir ${config_1.paths.distStatic}`.split(' '));
}
function runIsomor() {
    logol_1.info('Run isomor');
    return shell('isomor-transpiler', [], {
        ISOMOR_DIST_APP_FOLDER: config_1.config.tmpFolder,
        ISOMOR_NO_TYPES: 'true',
        ISOMOR_SKIP_COPY_SRC: 'true',
        ISOMOR_SERVER_FOLDER: config_1.config.apiFolder,
        ISOMOR_SRC_FOLDER: config_1.config.srcFolder,
        ISOMOR_STATIC_FOLDER: config_1.paths.distStatic,
        ISOMOR_DIST_SERVER_FOLDER: config_1.paths.distServer,
    });
}
function shell(command, args, env) {
    logol_1.debug('shell', command, args.join(' '));
    return new Promise((resolve) => {
        const cmd = spawn(command, args, {
            env: Object.assign({ COLUMNS: process.env.COLUMNS || process.stdout.columns.toString(), LINES: process.env.LINES || process.stdout.rows.toString(), TEMP_FOLDER: config_1.config.tmpFolder }, env, process.env),
        });
        cmd.stdout.on('data', (data) => {
            process.stdout.write(chalk_1.gray(data.toString()));
        });
        cmd.stderr.on('data', (data) => {
            const dataStr = data.toString();
            if (dataStr.indexOf('warning') === 0) {
                process.stdout.write(chalk_1.yellow('warming') + dataStr.substring(7));
            }
            else {
                process.stdout.write(chalk_1.red(data.toString()));
            }
        });
        cmd.on('close', (code) => (code ? process.exit(code) : resolve()));
    });
}
//# sourceMappingURL=compile.js.map