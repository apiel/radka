import * as cp from 'child_process';
import { promisify } from 'util';
import { join, basename, extname, dirname } from 'path';
import * as glob from 'glob';

import { srcPath, distPath, config } from './config';

const exec = promisify(cp.exec as any);
const globAsync = promisify(glob);

export async function compile() {
    const output = await exec(
        `babel ${srcPath} --out-dir ${config.tmpFolder}`,
        {
            stdio: 'inherit',
            shell: true,
        },
    );
    console.log('out', output);

    await generatePages();
}

async function generatePages() {
    const basePath = join(config.tmpFolder, config.pagesFolder);
    const files = await globAsync(join(basePath, '**', '*'));
    for (const file of files) {
        const filename = basename(file, extname(file));
        const htmlPath = join(distPath, join(
            dirname(file),
            filename === 'index' ? '' : filename,
            'index.html',
        ).substr(basePath.length));
        console.log('file', { file, htmlPath });
    }
}
