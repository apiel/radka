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
const fs_extra_1 = require("fs-extra");
const chokidar_1 = require("chokidar");
const path_1 = require("path");
const config_1 = require("./config");
const compile_1 = require("./compile");
const utils_1 = require("./utils");
const generatePages_1 = require("./generatePages");
const server_1 = require("./server");
const lib_1 = require("./lib");
let serv;
function dev(rebuild) {
    return __awaiter(this, void 0, void 0, function* () {
        logol_1.info('Run Radka.js in dev mode');
        config_1.setDev();
        if (rebuild || !(yield fs_extra_1.pathExists(config_1.paths.distStatic))) {
            yield compile_1.build();
        }
        watcher();
        yield startServer();
    });
}
exports.dev = dev;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        if (serv) {
            serv.close();
        }
        const skipTimeout = true;
        serv = (yield server_1.server(skipTimeout)).server;
    });
}
function watcher() {
    logol_1.info('Starting watch mode.');
    chokidar_1.watch('.', {
        ignoreInitial: true,
        cwd: config_1.paths.src,
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    })
        .on('ready', () => logol_1.info('Initial scan complete. Ready for changes...'))
        .on('add', (file) => {
        logol_1.info(`File ${file} has been added`);
        handleFile(file);
    })
        .on('change', (file) => {
        logol_1.info(`File ${file} has been changed`);
        handleFile(file);
    })
        .on('unlink', (file) => {
        logol_1.info(`File ${file} has been removed`, '(do nothing)');
    });
}
function handleFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (filePath.startsWith(config_1.config.apiFolder)) {
            yield handleApiFile(filePath);
        }
        else if (filePath.startsWith(config_1.config.bundleFolder)) {
            yield buildStatic(true);
        }
        else {
            yield handleOtherFile(filePath);
        }
    });
}
function handleOtherFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield buildStatic();
        if (filePath.startsWith(config_1.config.pagesFolder)) {
            const pagePaths = yield generatePages_1.collectPagePaths();
            const file = path_1.join(config_1.paths.pages, path_1.basename(filePath, path_1.extname(filePath)) + '.js');
            const pagePath = Object.values(pagePaths).find(p => p.file === file);
            yield generatePages_1.generatePage(pagePath, pagePaths);
        }
        else {
            yield generatePages_1.generatePages();
        }
    });
}
function handleApiFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.fileIsInRoot(filePath, config_1.config.apiFolder)) {
            yield compile_1.runIsomor();
            yield buildStatic();
        }
        yield fs_extra_1.copy(path_1.join(config_1.paths.src, filePath), path_1.join(config_1.paths.distServer, filePath));
        yield startServer();
    });
}
function buildStatic(forceParcel = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const md5RkaImport = yield utils_1.fileToMd5(config_1.paths.rkaImport);
        yield fs_extra_1.remove(config_1.config.tmpFolder);
        yield compile_1.runBabel();
        if (forceParcel || md5RkaImport !== (yield utils_1.fileToMd5(config_1.paths.rkaImport))) {
            yield compile_1.runParcel();
        }
    });
}
function injectHotReloadToBundle() {
    const code = `const { subscribe } = require("isomor");
    console.log('sub to hot reload');
    subscribe((payload) => payload === "r_ka_reload" && location.reload());`;
    return fs_extra_1.writeFile(config_1.getBundleFile(), lib_1.rkaLoader('r_ka_reload', code));
}
//# sourceMappingURL=dev.js.map