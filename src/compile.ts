import * as spawn from 'cross-spawn';
import { join } from 'path';
import {
    remove,
    copy,
    readFile,
    writeFile,
    ensureFile,
    pathExists,
} from 'fs-extra';
import { info, debug, error } from 'logol';
import { gray, yellow, red } from 'chalk';

import { config, paths, DEV } from './config';
import { generatePages } from './generatePages';
import { rkaLoader } from './lib';
import { injectHotReloadToBundle } from './dev';

export async function build() {
    // ToDo: is it good idea to remove distStaticPath? site folder might not only contain generated file?
    await remove(paths.distStatic);
    await remove(config.tmpFolder);

    await runBabel();

    await injectBaseCodeToBundle();

    if (await pathExists(paths.srcApi)) {
        await copyApiToServer(); // ToDo is this necessary???
        await runIsomor();
    }

    await runParcel();

    await generatePages();
}

async function read(file: string) {
    await ensureFile(file);
    const content = await readFile(file);
    return content.toString();
}

export async function injectBaseCodeToBundle() {
    const bundleFile = paths.tmpBundleEntry;

    const codes = [
        rkaLoader('r_ka_bundle', await read(bundleFile)),
        await read(paths.rkaImport),
        'window.require = require;',
        'require("@babel/polyfill");',
    ];
    if (DEV) {
        // we should move this in dev, by injecting in the page while serving
        codes.push(injectHotReloadToBundle());
    }
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
    return copy(paths.srcApi, paths.distServerApi, {
        recursive: true,
    });
}

export function runBabel() {
    info('Run babel');
    return shell(
        'babel',
        `${paths.src} --out-dir ${config.tmpFolder} --copy-files --extensions .ts,.tsx,.js,.jsx`.split(
            ' ',
        ),
    );
}

export async function runParcel() {
    info('Run parcel');

    // ToDo: find better way, in generate file should only include CSS if file exist
    // (in one way, shouldnt CSS always exist)
    await ensureFile(join(paths.distStatic, 'index.css'));

    return shell(
        'parcel',
        `build ${paths.tmpBundleEntry} --dist-dir ${paths.distStatic}`.split(
            ' ',
        ),
    );
}

export function runIsomor() {
    info('Run isomor');

    return shell('isomor-transpiler', [], {
        ISOMOR_MODULE_FOLDER: join(config.tmpFolder, config.apiFolder),
        ISOMOR_SRC_FOLDER: join(config.srcFolder, config.apiFolder),
        ISOMOR_STATIC_FOLDER: paths.distStatic,
        ISOMOR_SERVER_FOLDER: paths.distServer,
    });
}

function shell(
    command: string,
    args?: ReadonlyArray<string>,
    env?: NodeJS.ProcessEnv,
) {
    debug('shell', command, args.join(' '));
    return new Promise<number>((resolve) => {
        const cmd = spawn(command, args, {
            cwd: process.cwd(),
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
        // cmd.on('close', (code) => (code ? process.exit(code) : resolve()));
        cmd.on('close', (code) => {
            if (code > 0) {
                error('Watch out, shell command returned an error.');
            }
            resolve(code);
        });
    });
}
