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
const logol_1 = require("logol");
const util_1 = require("util");
const jsx_pragmatic_1 = require("jsx-pragmatic");
const path_1 = require("path");
const glob = require("glob");
const fs_extra_1 = require("fs-extra");
const config_1 = require("./config");
const exec = util_1.promisify(cp.exec);
const globAsync = util_1.promisify(glob);
function compile() {
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield exec(`babel ${config_1.srcPath} --out-dir ${config_1.config.tmpFolder}`, {
            stdio: 'inherit',
            shell: true,
        });
        yield generatePages();
    });
}
exports.compile = compile;
function generatePages() {
    return __awaiter(this, void 0, void 0, function* () {
        const basePath = path_1.join(config_1.config.tmpFolder, config_1.config.pagesFolder);
        const files = yield globAsync(path_1.join(basePath, '**', '*.*'));
        logol_1.log('Pages component founds', files);
        for (const file of files) {
            const filename = path_1.basename(file, path_1.extname(file));
            const htmlPath = path_1.join(config_1.distPath, path_1.join(path_1.dirname(file), filename === 'index' ? '' : filename, 'index.html').substr(basePath.length));
            logol_1.log('Load page component', file);
            const page = require(file).default;
            console.log('page', page);
            if (page.propsList) {
                for (const props of page.propsList) {
                    yield saveComponentToHtml(page, applyPropsToHtmlPath(htmlPath, props), props);
                }
            }
            else {
                yield saveComponentToHtml(page, htmlPath);
            }
        }
    });
}
function applyPropsToHtmlPath(htmlPath, props) {
    let htmlPathWithProps = htmlPath;
    Object.keys(props).forEach(key => {
        htmlPathWithProps = htmlPathWithProps.replace(`[${key}]`, props[key]);
    });
    return htmlPathWithProps;
}
function saveComponentToHtml(page, htmlPath, props) {
    return __awaiter(this, void 0, void 0, function* () {
        logol_1.log('Generate page', htmlPath);
        const source = page.component(props).render(jsx_pragmatic_1.html());
        yield fs_extra_1.ensureFile(htmlPath);
        yield fs_extra_1.outputFile(htmlPath, source);
    });
}
//# sourceMappingURL=compile.js.map