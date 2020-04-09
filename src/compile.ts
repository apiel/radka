import { spawn } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { remove, ensureFileSync, copy } from 'fs-extra';
import { info, debug } from 'logol';
import * as fs from 'fs';
import { gray, yellow, red } from 'chalk';

import {
    srcPath,
    config,
    bundlePath,
    distStaticPath,
    distServerPath,
} from './config';
import { generatePages } from './generatePages';

const appendFile = promisify(fs.appendFile);

export async function compile() {
    // ToDo: is it good idea to remove distStaticPath? site folder might not only contain generated file?
    await remove(distStaticPath);
    await remove(config.tmpFolder);

    await runBabel();

    await injectBaseCodeToBundle();

    await copyApiToServer();

    await runIsomor();
    await runParcel();

    await generatePages();
}

function injectBaseCodeToBundle() {
    const codes = [
        'window.require = require;',
        '(window.r_ka || []).forEach(function(fn) { fn(); });',
        'require("@babel/polyfill");',
    ];
    if (config.turbolinks === 'true') {
        codes.push('require("turbolinks").start();');
    }
    return appendFile(
        join(bundlePath, 'index.js'),
        codes.join(''),
    );
    // return appendFile(
    //     join(bundlePath, 'index.js'),
    //     'window.require = require;(window.r_ka || []).forEach(function(fn) { fn(); });require("@babel/polyfill");',
    // );
}

function copyApiToServer() {
    return copy(join(srcPath, config.apiFolder), join(distServerPath, config.apiFolder));
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
    ensureFileSync(join(distStaticPath, 'index.css'));

    return shell(
        'parcel',
        `build ${join(
            bundlePath,
            'index.js',
        )} --out-dir ${distStaticPath}`.split(' '),
    );
}

function runIsomor() {
    info('Run isomor');

    return shell('isomor-transpiler', [], {
        ISOMOR_DIST_APP_FOLDER: config.tmpFolder,
        ISOMOR_NO_TYPES: 'true',
        ISOMOR_SKIP_COPY_SRC: 'true',
        ISOMOR_SERVER_FOLDER: config.apiFolder,
        ISOMOR_SRC_FOLDER: config.srcFolder,
        ISOMOR_STATIC_FOLDER: distStaticPath,
        ISOMOR_DIST_SERVER_FOLDER: distServerPath,
    });
}

function shell(
    command: string,
    args?: ReadonlyArray<string>,
    env?: NodeJS.ProcessEnv,
) {
    debug('shell', command, args.join(' '));
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
