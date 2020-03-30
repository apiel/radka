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
const cp = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const config_1 = require("./config");
const generatePages_1 = require("./generatePages");
const logol_1 = require("logol");
const exec = util_1.promisify(cp.exec);
function compile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.remove(config_1.config.tmpFolder);
        const babelOutput = yield runBabel();
        process.stdout.write(babelOutput.stdout);
        const parcelOutput = yield runParcel();
        process.stdout.write(parcelOutput.stdout);
        yield generatePages_1.generatePages();
    });
}
exports.compile = compile;
function runBabel() {
    logol_1.info('Run babel');
    const configPath = path_1.join(__dirname, '..', '.babelrc.jsx.json');
    return shell(`babel ${config_1.srcPath} --out-dir ${config_1.config.tmpFolder} --config-file ${configPath}`);
}
function runParcel() {
    logol_1.info('Run parcel');
    const paths = [
        path_1.join(config_1.bundlePath, 'index.js'),
    ];
    return shell(`parcel build ${paths.join(' ')}`);
}
function shell(cmd) {
    return exec(cmd, {
        stdio: 'inherit',
        shell: true,
        env: Object.assign(Object.assign({}, process.env), { TEMP_FOLDER: config_1.config.tmpFolder }),
    });
}
//# sourceMappingURL=compile.js.map