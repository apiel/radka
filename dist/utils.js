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
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const md5 = require("md5");
function fileToMd5(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield fs_extra_1.pathExists(filePath))
            ? md5((yield fs_extra_1.readFile(filePath)).toString())
            : '';
    });
}
exports.fileToMd5 = fileToMd5;
function fileIsInRoot(filePath, folder) {
    return (filePath
        .substr(folder.length)
        .split(path_1.sep)
        .filter((f) => f).length === 1);
}
exports.fileIsInRoot = fileIsInRoot;
//# sourceMappingURL=utils.js.map