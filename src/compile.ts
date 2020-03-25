import * as webpack from 'webpack';
import { srcPath, distPath } from './config';

const webpackConfig = {
    context: srcPath,
    // entry: './src-demo/hello.ts',
    output: {
        pathinfo: true,
        path: distPath,
        // filename: 'bundle.js',
    },
    module: {
        rules: [{ test: /\.tsx?$/, use: 'ts-loader' }],
    },
};

export function compile() {
    const compiler = webpack(webpackConfig);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }
            return resolve({
                stats,
            });
        });
    });
}
