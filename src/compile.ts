import * as cp from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { remove, ensureFileSync } from 'fs-extra';
import { info } from 'logol';
import * as fs from 'fs';

import { srcPath, config, bundlePath, distPath } from './config';
import { generatePages } from './generatePages';

const exec = promisify(cp.exec as any);
const appendFile = promisify(fs.appendFile);

export async function compile() {
    // ToDo: is it good idea to remove distPath? site folder might not only contain generated file?
    await remove(distPath);
    await remove(config.tmpFolder);

    const babelOutput = await runBabel();
    process.stdout.write(babelOutput.stdout);

    appendFile(
        join(bundlePath, 'index.js'),
        'window.require = require;(window.r_ka || []).forEach(function(fn) { fn(); });',
    );

    const parcelOutput = await runParcel();
    process.stdout.write(parcelOutput.stdout);

    await generatePages();
}

function runBabel() {
    info('Run babel');
    return shell(
        `babel ${srcPath} --out-dir ${config.tmpFolder} --copy-files`,
    );
}

function runParcel() {
    info('Run parcel');

    // ToDo: find better way, in generate file should only include CSS if file exist 
    // (in one way, shouldnt CSS always exist)
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
