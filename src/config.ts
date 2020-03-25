import { resolve, join } from 'path';

export const CONFIG_FILE = 'radka.config';
export const ROOT_FOLDER = process.env.ROOT_FOLDER
    ? resolve(process.env.ROOT_FOLDER)
    : process.cwd();

export let config = {
    srcFolder: 'src',
    distFolder: 'site',
};

export let distPath = join(ROOT_FOLDER, config.distFolder);

export function setConfig(newConfig = {}) {
    config = { ...config, ...newConfig };
    distPath = join(ROOT_FOLDER, config.distFolder);
}

export function setDistPath(path: string) {
    distPath = path;
}

