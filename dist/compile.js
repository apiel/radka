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
const glob = require("glob");
const config_1 = require("./config");
const exec = util_1.promisify(cp.exec);
const globAsync = util_1.promisify(glob);
function compile() {
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield exec(`babel ${config_1.srcPath} --out-dir ${config_1.config.tmpFolder}`, {
            stdio: 'inherit',
            shell: true,
        });
        console.log('out', output);
        yield generatePages();
    });
}
exports.compile = compile;
function generatePages() {
    return __awaiter(this, void 0, void 0, function* () {
        const basePath = path_1.join(config_1.config.tmpFolder, config_1.config.pagesFolder);
        const files = yield globAsync(path_1.join(basePath, '**', '*'));
        console.log('files', files);
    });
}
//# sourceMappingURL=compile.js.map