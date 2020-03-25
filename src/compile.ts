import * as webpack from 'webpack';

const webpackConfig = {
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader' },
        ],
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
