#!/usr/bin/env node

import { info } from 'logol';
import * as minimist from 'minimist';
import { cosmiconfig } from 'cosmiconfig';

import { CONFIG_FILE, setConfig, config as globalConfig } from './config';
import { build } from './compile';
import { dev } from './dev';
import { server } from './server';

const cosmiconfigOptions = {
    searchPlaces: [
        'package.json',
        `${CONFIG_FILE}.json`,
        `${CONFIG_FILE}.yaml`,
        `${CONFIG_FILE}.yml`,
        `${CONFIG_FILE}.js`,
    ],
};

async function run() {
    const { configFile, _, skipRebuild, ...config } = minimist(process.argv.slice(2));
    if (config.help || config.h) {
        console.log(`Usage: radka [dev|server|build]

Options:
  --configFile=./config.json
${Object.keys(globalConfig)
    .map((k) => `  --${k}=${globalConfig[k]}\n`)
    .join('')}
`);
    } else {
        info('Start Radka');

        const cosmic = configFile
            ? await cosmiconfig(CONFIG_FILE).load(configFile)
            : await cosmiconfig(CONFIG_FILE, cosmiconfigOptions).search();

        setConfig(cosmic && cosmic.config);
        setConfig(config);
        info('Config', globalConfig);
        if (_.includes('dev')) {
            await dev(skipRebuild);
        } else if (_.includes('server')) {
            await server();
        } else {
            await build();
        }
    }
}

run();
