import { pathExists, readFile } from 'fs-extra';
import { sep } from 'path';
import * as md5 from 'md5';

export async function fileToMd5(filePath: string) {
    return (await pathExists(filePath))
        ? md5((await readFile(filePath)).toString())
        : '';
}

export function fileIsInRoot(filePath: string, folder: string) {
    return (
        filePath
            .substr(folder.length)
            .split(sep)
            .filter((f) => f).length === 1
    );
}