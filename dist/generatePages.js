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
const logol_1 = require("logol");
const util_1 = require("util");
const html_1 = require("./html");
const path_1 = require("path");
const glob = require("glob");
const fs_extra_1 = require("fs-extra");
const url_join_1 = require("url-join");
const config_1 = require("./config");
const lib_1 = require("./lib");
const transform_1 = require("./transform");
const utils_1 = require("./utils");
const globAsync = util_1.promisify(glob);
function generatePages() {
    return __awaiter(this, void 0, void 0, function* () {
        const pagePaths = yield collectPagePaths();
        for (const pagePath of Object.values(pagePaths)) {
            yield generatePage(pagePath, pagePaths);
        }
    });
}
exports.generatePages = generatePages;
function generatePage({ page, file }, pagePaths) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlPath = path_1.join(config_1.paths.distStatic, getRoutePath(file));
        logol_1.log('Load page component', file);
        page.setPaths(config_1.paths);
        if (page.propsList) {
            for (const props of page.propsList) {
                yield saveComponentToHtml(page, applyPropsToPath(htmlPath, props), pagePaths, props);
            }
        }
        else {
            yield saveComponentToHtml(page, htmlPath, pagePaths);
        }
    });
}
exports.generatePage = generatePage;
function collectPagePaths() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield globAsync(path_1.join(config_1.paths.pages, '**', `*${config_1.config.pagesSuffix}.js`));
        logol_1.log('Pages component founds', files);
        const pagePaths = {};
        files.forEach((file) => delete require.cache[file]);
        global.r_ka_imports = [];
        files.forEach((file) => {
            const page = require(file).default;
            pagePaths[page.linkId] = { file, page };
        });
        console.log('keys', Object.keys(pagePaths));
        return pagePaths;
    });
}
exports.collectPagePaths = collectPagePaths;
function getRoutePath(file, glue = path_1.join) {
    const filename = path_1.basename(file, `${config_1.config.pagesSuffix}${path_1.extname(file)}`);
    return glue(path_1.dirname(file), filename === 'index' ? '' : filename, 'index.html').substr(config_1.paths.pages.length);
}
function applyPropsToPath(path, props) {
    let pathWithProps = path;
    Object.keys(props).forEach((key) => {
        pathWithProps = pathWithProps.replace(`[${key}]`, props[key]);
    });
    return pathWithProps;
}
function saveComponentToHtml(page, htmlPath, links, props) {
    return __awaiter(this, void 0, void 0, function* () {
        logol_1.log('Generate page', htmlPath);
        let source = page.component(props).render(html_1.html({ transform: transform_1.transform }));
        source = applyPropsToLinks(source, links);
        source = yield appendImportToSource(source, '.js', 'script');
        source = yield appendImportToSource(source, '.css', 'style');
        source = yield injectBundles(source);
        yield fs_extra_1.ensureFile(htmlPath);
        yield fs_extra_1.outputFile(htmlPath, source);
    });
}
function appendImportToSource(source, ext, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const imports = yield Promise.all(global.r_ka_imports
            .filter((path) => path.endsWith(ext))
            .map((path) => fs_extra_1.readFile(path_1.join(config_1.config.tmpFolder, path.substr(config_1.paths.pages.length)))));
        let code = imports.map((s) => s.toString()).join();
        if (ext === '.js') {
            code = lib_1.rkaLoader('r_ka_imports', code);
        }
        return injectScript(source, `<${tag}>${code}</${tag}>`);
    });
}
function applyPropsToLinks(source, links) {
    return source.replace(/%link%([^%]+)%([^%]*)%/g, (match, linkId, propsStr) => {
        const props = {};
        propsStr.split(';').forEach((prop) => {
            const [key, value] = prop.split('=');
            props[key] = value;
        });
        return (config_1.config.baseUrl +
            applyPropsToPath(getRoutePath(links[linkId].file, url_join_1.default).replace(/\/index.html$/g, '') || '/', props));
    });
}
function injectBundles(source) {
    return __awaiter(this, void 0, void 0, function* () {
        const { baseUrl } = config_1.config;
        const script = `
    <script src="${baseUrl}/index.js?${yield utils_1.fileToMd5(path_1.join(config_1.paths.distStatic, 'index.js'))}" data-turbolinks-suppress-warning></script>
    <link rel="stylesheet" type="text/css" href="${baseUrl}/index.css?${yield utils_1.fileToMd5(path_1.join(config_1.paths.distStatic, 'index.css'))}">`;
        return injectScript(source, script);
    });
}
function injectScript(source, script, tag = '</body>') {
    if (source.indexOf(tag) !== -1) {
        source = source.replace(tag, `${script}${tag}`);
    }
    else if (tag === '</head>') {
        source = `${script}${source}`;
    }
    else {
        source = `${source}${script}`;
    }
    return source;
}
//# sourceMappingURL=generatePages.js.map