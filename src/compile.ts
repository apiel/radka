import * as cp from 'child_process';
import { promisify } from 'util';

import { srcPath, distPath } from './config';

const exec = promisify(cp.exec as any);

export async function compile() {
    const output = await exec(`babel ${srcPath} --out-dir ${distPath}`, {
        stdio: 'inherit',
        shell: true,
    });
    console.log('out', output);
}
