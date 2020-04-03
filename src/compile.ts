import { spawn } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { remove, ensureFileSync } from 'fs-extra';
import { info } from 'logol';
import * as fs from 'fs';
import { gray, yellow, red } from 'chalk';

import { srcPath, config, bundlePath, distPath } from './config';
import { generatePages } from './generatePages';

const appendFile = promisify(fs.appendFile);

export async function compile() {
    // ToDo: is it good idea to remove distPath? site folder might not only contain generated file?
    await remove(distPath);
    await remove(config.tmpFolder);

    await runBabel();

    appendFile(
        join(bundlePath, 'index.js'),
        'window.require = require;(window.r_ka || []).forEach(function(fn) { fn(); });',
    );

    // await runIsomor();
    await runParcel();

    await generatePages();
}

function runBabel() {
    info('Run babel');
    return shell(
        'babel',
        `${srcPath} --out-dir ${config.tmpFolder} --copy-files`.split(' '),
    );
}

function runParcel() {
    info('Run parcel');

    // ToDo: find better way, in generate file should only include CSS if file exist
    // (in one way, shouldnt CSS always exist)
    ensureFileSync(join(distPath, 'index.css'));

    return shell(
        'parcel',
        `build ${join(bundlePath, 'index.js')} --out-dir ${distPath}`.split(
            ' ',
        ),
    );
}

function runIsomor() {
    info('Run isomor');

    return shell('isomor-transpiler', [], {
        ISOMOR_DIST_APP_FOLDER: config.tmpFolder,
    });
}

function shell(
    command: string,
    args?: ReadonlyArray<string>,
    env?: NodeJS.ProcessEnv,
) {
    return new Promise((resolve) => {
        const cmd = spawn(command, args, {
            env: {
                COLUMNS:
                    process.env.COLUMNS || process.stdout.columns.toString(),
                LINES: process.env.LINES || process.stdout.rows.toString(),
                TEMP_FOLDER: config.tmpFolder,
                ...env,
                ...process.env,
            },
        });
        cmd.stdout.on('data', (data) => {
            process.stdout.write(gray(data.toString()));
        });
        cmd.stderr.on('data', (data) => {
            const dataStr = data.toString();
            if (dataStr.indexOf('warning') === 0) {
                process.stdout.write(yellow('warming') + dataStr.substring(7));
            } else {
                process.stdout.write(red(data.toString()));
            }
        });
        cmd.on('close', resolve);
    });
}
