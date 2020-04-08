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
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const logol_1 = require("logol");
const fs = require("fs");
const chalk_1 = require("chalk");
const config_1 = require("./config");
const generatePages_1 = require("./generatePages");
const appendFile = util_1.promisify(fs.appendFile);
function compile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.remove(config_1.distStaticPath);
        yield fs_extra_1.remove(config_1.config.tmpFolder);
        yield runBabel();
        appendFile(path_1.join(config_1.bundlePath, 'index.js'), 'window.require = require;(window.r_ka || []).forEach(function(fn) { fn(); });require("@babel/polyfill");');
        yield fs_extra_1.copy(path_1.join(config_1.config.tmpFolder, 'api'), path_1.join(config_1.config.tmpFolder, 'api'));
        yield runIsomor();
        yield runParcel();
        yield generatePages_1.generatePages();
    });
}
exports.compile = compile;
function runBabel() {
    logol_1.info('Run babel');
    return shell('babel', `${config_1.srcPath} --out-dir ${config_1.config.tmpFolder} --copy-files`.split(' '));
}
function runParcel() {
    logol_1.info('Run parcel');
    fs_extra_1.ensureFileSync(path_1.join(config_1.distStaticPath, 'index.css'));
    return shell('parcel', `build ${path_1.join(config_1.bundlePath, 'index.js')} --out-dir ${config_1.distStaticPath}`.split(' '));
}
function runIsomor() {
    logol_1.info('Run isomor');
    return shell('isomor-transpiler', [], {
        ISOMOR_DIST_APP_FOLDER: config_1.config.tmpFolder,
        ISOMOR_NO_TYPES: 'true',
        ISOMOR_SKIP_COPY_SRC: 'true',
        ISOMOR_SERVER_FOLDER: config_1.config.apiFolder,
        ISOMOR_SRC_FOLDER: config_1.config.srcFolder,
        ISOMOR_STATIC_FOLDER: config_1.distStaticPath,
        ISOMOR_DIST_SERVER_FOLDER: config_1.distApiPath,
    });
}
function shell(command, args, env) {
    logol_1.debug('shell', command, args.join(' '));
    return new Promise((resolve) => {
        const cmd = child_process_1.spawn(command, args, {
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
        cmd.on('close', resolve);
    });
}
//# sourceMappingURL=compile.js.map