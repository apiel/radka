#!/usr/bin/env node

import { info } from 'logol';
import * as minimist from 'minimist';
import { cosmiconfig } from 'cosmiconfig';

import { CONFIG_FILE, setConfig } from './config';
import { compile } from './compile';

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
    const {
        configFile,
        ...config
    } = minimist(process.argv.slice(2));
    if (config.help || config.h) {
        console.log(`Usage: radka

Options:
  --configFile=./config.json
  --srcFolder=src
  --distFolder=site
`);
    } else {
        info('Start Radka');

        const cosmic = configFile
            ? await cosmiconfig(CONFIG_FILE).load(configFile)
            : await cosmiconfig(CONFIG_FILE, cosmiconfigOptions).search();

        setConfig(cosmic?.config);
        setConfig(config);
        compile();
    }
}

run();
