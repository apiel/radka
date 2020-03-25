import { resolve, join } from 'path';
import { dirSync } from 'tmp';

export const CONFIG_FILE = 'radka.config';
export const ROOT_FOLDER = process.env.ROOT_FOLDER
    ? resolve(process.env.ROOT_FOLDER)
    : process.cwd();

export let config = {
    srcFolder: 'src',
    distFolder: 'site',
    tmpFolder: dirSync().name,
};

export let distPath = join(ROOT_FOLDER, config.distFolder);
export let srcPath = join(ROOT_FOLDER, config.srcFolder);

export function setConfig(newConfig = {}) {
    config = { ...config, ...newConfig };
    distPath = join(ROOT_FOLDER, config.distFolder);
    srcPath = join(ROOT_FOLDER, config.srcFolder);
}
