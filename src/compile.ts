import * as cp from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import * as glob from 'glob';
import { remove } from 'fs-extra';

import { srcPath, config, bundlePath } from './config';
import { generatePages } from './generatePages';
import { info } from 'logol';

const exec = promisify(cp.exec as any);

export async function compile() {
    await remove(config.tmpFolder);

    const babelOutput = await runBabel();
    process.stdout.write(babelOutput.stdout);

    const parcelOutput = await runParcel();
    process.stdout.write(parcelOutput.stdout);

    await generatePages();
}

function runBabel() {
    info('Run babel');
    const configPath = join(__dirname, '..', '.babelrc.jsx.json');
    return shell(
        `babel ${srcPath} --out-dir ${config.tmpFolder} --config-file ${configPath}`,
    );
}

function runParcel() {
    info('Run parcel');
    const paths = [
        join(bundlePath, 'index.js'),
        join(bundlePath, '.import.js'),
    ];
    return shell(
        `parcel build ${paths.join(' ')}`,
    );
}

function shell(cmd: string) {
    return exec(cmd, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, TEMP_FOLDER: config.tmpFolder },
    });
}
