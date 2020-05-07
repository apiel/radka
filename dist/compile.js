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
Object.defineProperty(exports, "__esModule", { value: true });
const spawn = require("cross-spawn");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const logol_1 = require("logol");
const chalk_1 = require("chalk");
const config_1 = require("./config");
const generatePages_1 = require("./generatePages");
const lib_1 = require("./lib");
const dev_1 = require("./dev");
function build() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.remove(config_1.paths.distStatic);
        yield fs_extra_1.remove(config_1.config.tmpFolder);
        yield runBabel();
        yield injectBaseCodeToBundle();
        if (yield fs_extra_1.pathExists(config_1.paths.srcApi)) {
            yield copyApiToServer();
            yield runIsomor();
        }
        yield runParcel();
        yield generatePages_1.generatePages();
    });
}
exports.build = build;
function read(file) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.ensureFile(file);
        const content = yield fs_extra_1.readFile(file);
        return content.toString();
    });
}
function injectBaseCodeToBundle() {
    return __awaiter(this, void 0, void 0, function* () {
        const bundleFile = config_1.getBundleFile();
        const codes = [
            lib_1.rkaLoader('r_ka_bundle', yield read(bundleFile)),
            yield read(config_1.paths.rkaImport),
            'window.require = require;',
            'require("@babel/polyfill");',
        ];
        if (config_1.DEV) {
            codes.push(dev_1.injectHotReloadToBundle());
        }
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
    return fs_extra_1.copy(config_1.paths.srcApi, config_1.paths.distServerApi, {
        recursive: true,
    });
}
exports.copyApiToServer = copyApiToServer;
function runBabel() {
    logol_1.info('Run babel');
    return shell('babel', `${config_1.paths.src} --out-dir ${config_1.config.tmpFolder} --copy-files --extensions .ts,.tsx,.js,.jsx`.split(' '));
}
exports.runBabel = runBabel;
function runParcel() {
    return __awaiter(this, void 0, void 0, function* () {
        logol_1.info('Run parcel');
        yield fs_extra_1.ensureFile(path_1.join(config_1.paths.distStatic, 'index.css'));
        return shell('parcel', `build ${path_1.join(config_1.paths.bundle, 'index.js')} --out-dir ${config_1.paths.distStatic}`.split(' '));
    });
}
exports.runParcel = runParcel;
function runIsomor() {
    logol_1.info('Run isomor');
    return shell('isomor-transpiler', [], {
        ISOMOR_MODULE_FOLDER: path_1.join(config_1.config.tmpFolder, config_1.config.apiFolder),
        ISOMOR_SRC_FOLDER: path_1.join(config_1.config.srcFolder, config_1.config.apiFolder),
        ISOMOR_STATIC_FOLDER: config_1.paths.distStatic,
        ISOMOR_SERVER_FOLDER: config_1.paths.distServer,
    });
}
exports.runIsomor = runIsomor;
function shell(command, args, env) {
    logol_1.debug('shell', command, args.join(' '));
    return new Promise((resolve) => {
        const cmd = spawn(command, args, {
            cwd: process.cwd(),
            env: Object.assign(Object.assign({ COLUMNS: process.env.COLUMNS || process.stdout.columns.toString(), LINES: process.env.LINES || process.stdout.rows.toString(), TEMP_FOLDER: config_1.config.tmpFolder }, env), process.env),
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
        cmd.on('close', (code) => {
            if (code > 0) {
                logol_1.error('Watch out, shell command returned an error.');
            }
            resolve(code);
        });
    });
}
//# sourceMappingURL=compile.js.map