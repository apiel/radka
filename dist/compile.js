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
const html_1 = require("./html");
const path_1 = require("path");
const glob = require("glob");
const fs_extra_1 = require("fs-extra");
const config_1 = require("./config");
const transform_1 = require("./transform");
const exec = util_1.promisify(cp.exec);
const globAsync = util_1.promisify(glob);
function compile() {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = path_1.join(__dirname, '..', '.babelrc.jsx.json');
        const output = yield exec(`babel ${config_1.srcPath} --out-dir ${config_1.config.tmpFolder} --config-file ${configPath}`, {
            stdio: 'inherit',
            shell: true,
            env: Object.assign(Object.assign({}, process.env), { TEMP_FOLDER: config_1.config.tmpFolder }),
        });
        process.stdout.write(output.stdout);
        yield generatePages();
    });
}
exports.compile = compile;
function generatePages() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield globAsync(path_1.join(config_1.pagesPath, '**', `*${config_1.config.pagesSuffix}.js`));
        const links = collectPageLinks(files);
        logol_1.log('Pages component founds', links);
        for (const file of files) {
            const htmlPath = path_1.join(config_1.distPath, getRoutePath(file));
            logol_1.log('Load page component', file);
            const page = require(file).default;
            if (page.propsList) {
                for (const props of page.propsList) {
                    yield saveComponentToHtml(page, applyPropsToPath(htmlPath, props), links, props);
                }
            }
            else {
                yield saveComponentToHtml(page, htmlPath, links);
            }
        }
    });
}
function collectPageLinks(files) {
    const links = {};
    files.forEach(file => {
        const page = require(file).default;
        links[page.linkId] = file;
    });
    return links;
}
function getRoutePath(file) {
    const filename = path_1.basename(file, `${config_1.config.pagesSuffix}${path_1.extname(file)}`);
    return path_1.join(path_1.dirname(file), filename === 'index' ? '' : filename, 'index.html').substr(config_1.pagesPath.length);
}
function applyPropsToPath(path, props) {
    let pathWithProps = path;
    Object.keys(props).forEach(key => {
        pathWithProps = pathWithProps.replace(`[${key}]`, props[key]);
    });
    return pathWithProps;
}
function saveComponentToHtml(page, htmlPath, links, props) {
    return __awaiter(this, void 0, void 0, function* () {
        logol_1.log('Generate page', htmlPath);
        const source = page.component(props).render(html_1.html({ transform: transform_1.transform }));
        const sourceWithLinks = applyPropsToLinks(source, links);
        yield fs_extra_1.ensureFile(htmlPath);
        yield fs_extra_1.outputFile(htmlPath, sourceWithLinks);
    });
}
function applyPropsToLinks(source, links) {
    return source.replace(/%link%([^%]+)%([^%]*)%/g, (match, linkId, propsStr) => {
        const props = {};
        propsStr.split(';').forEach(prop => {
            const [key, value] = prop.split('=');
            props[key] = value;
        });
        return applyPropsToPath(getRoutePath(links[linkId]), props);
    });
}
//# sourceMappingURL=compile.js.map