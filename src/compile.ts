import * as cp from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { remove, ensureFileSync } from 'fs-extra';

import { srcPath, config, bundlePath, distPath } from './config';
import { generatePages } from './generatePages';
import { info } from 'logol';

const exec = promisify(cp.exec as any);

export async function compile() {
    // ToDo: is it good idea to remove distPath?
    await remove(distPath);
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
        `babel ${srcPath} --out-dir ${config.tmpFolder} --config-file ${configPath} --copy-files`,
    );
}

function runParcel() {
    info('Run parcel');

    // ToDo: find better way, in generate file should only include CSS if file exist
    ensureFileSync(join(distPath, 'index.css'));

    return shell(
        `parcel build ${join(bundlePath, 'index.js')} --out-dir ${distPath}`,
    );
}

function shell(cmd: string) {
    return exec(cmd, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, TEMP_FOLDER: config.tmpFolder },
    });
}
