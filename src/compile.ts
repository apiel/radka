import * as spawn from 'cross-spawn';
import { join } from 'path';
import {
    remove,
    ensureFileSync,
    copy,
    readFile,
    writeFile,
    ensureFile,
} from 'fs-extra';
import { info, debug } from 'logol';
import { gray, yellow, red } from 'chalk';

import { config, paths } from './config';
import { generatePages } from './generatePages';
import { rkaLoader } from './lib';

export async function build() {
    // ToDo: is it good idea to remove distStaticPath? site folder might not only contain generated file?
    await remove(paths.distStatic);
    await remove(config.tmpFolder);

    await runBabel();

    await injectBaseCodeToBundle();

    await copyApiToServer();

    await runIsomor();
    await runParcel();

    await generatePages();
}

async function read(file: string) {
    await ensureFile(file);
    const content = await readFile(file);
    return content.toString();
}

async function injectBaseCodeToBundle() {
    const bundleFile = join(paths.bundle, 'index.js');

    const codes = [
        rkaLoader('r_ka_bundle', await read(bundleFile)),
        await read(paths.rkaImport),
        'window.require = require;',
        'require("@babel/polyfill");',
    ];
    if (config.turbolinks === 'true') {
        codes.push(
            'if(!window.tb_link){require("turbolinks").start();window.tb_link=1;};',
        );
        codes.push(
            'if (window.r_ka_last !== window.location.href) { window.r_ka_last=window.location.href; Object.keys(window.r_ka || {}).forEach(function(k) { window.r_ka[k](); }); };',
        );
        codes.push('window.r_ka={};');
    } else {
        codes.push(
            'Object.keys(window.r_ka || {}).forEach(function(k) { window.r_ka[k](); });',
        );
    }
    await writeFile(bundleFile, codes.join(';'));
}

export function copyApiToServer() {
    return copy(
        join(paths.src, config.apiFolder),
        join(paths.distServer, config.apiFolder),
        {
            recursive: true,
        },
    );
}

export function runBabel() {
    info('Run babel');
    return shell(
        'babel',
        `${paths.src} --out-dir ${config.tmpFolder} --copy-files`.split(' '),
    );
}

export function runParcel() {
    info('Run parcel');

    // ToDo: find better way, in generate file should only include CSS if file exist
    // (in one way, shouldnt CSS always exist)
    ensureFileSync(join(paths.distStatic, 'index.css'));

    return shell(
        'parcel',
        `build ${join(paths.bundle, 'index.js')} --out-dir ${
            paths.distStatic
        }`.split(' '),
    );
}

export function runIsomor() {
    info('Run isomor');

    return shell('isomor-transpiler', [], {
        ISOMOR_DIST_APP_FOLDER: config.tmpFolder,
        ISOMOR_NO_TYPES: 'true',
        ISOMOR_SKIP_COPY_SRC: 'true',
        ISOMOR_SERVER_FOLDER: config.apiFolder,
        ISOMOR_SRC_FOLDER: config.srcFolder,
        ISOMOR_STATIC_FOLDER: paths.distStatic,
        ISOMOR_DIST_SERVER_FOLDER: paths.distServer,
        ISOMOR_NO_VALIDATION: 'true',
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
        cmd.on('close', (code) => (code ? process.exit(code) : resolve()));
    });
}
