const { resolve } = require('path');

const { name } = require('./package.json');

const webpack = require('webpack');
const CSSPlugin = require('mini-css-extract-plugin');
const JSMinimizer = require('uglifyjs-webpack-plugin');
const Favicon = require('favicons-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const BrowserSync = require('browser-sync-webpack-plugin');

/**
 * Returns space-separated and capitalized project name using "name" field from package.json
 */
const getProjectName = () =>
    name
        .split('-')
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(' ');

/**
 * Returns modified package name using its context information
 */
const getPackageName = ({ context }) =>
    'npm.' + context.match(/\/node_modules\/(.*?)(\/|$)/)[1].replace('@', '');

/**
 * Object which provide some output decorators
 */
const Logger = {
    error(...args) {
        console.log(
            ...args.map(
                arg => '\u001b[1m\u001b[31m' + arg + '\u001b[39m\u001b[22m',
            ),
        );
    },
    warn(...args) {
        console.log(
            ...args.map(
                arg => '\u001b[1m\u001b[33m' + arg + '\u001b[39m\u001b[22m',
            ),
        );
    },
    log(...args) {
        console.log(
            ...args.map(
                arg => '\u001b[1m\u001b[32m' + arg + '\u001b[39m\u001b[22m',
            ),
        );
    },
};

const PRODUCTION = {
    stats: {
        builtAt: false,
        cachedAssets: false,
        children: false,
        chunks: false,
        colors: true,
        depth: true,
        entrypoints: true,
        env: true,
        errors: true,
    },
    entry: {
        core: resolve(__dirname, 'src/core/index.js'),
        UI: resolve(__dirname, 'src/UI/index.jsx'),
    },
    output: {
        path: resolve(__dirname, 'build'),
        filename: '[name]-[hash:10].js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['node_modules', 'core', 'UI'],
    },
    optimization: {
        minimizer: [
            new JSMinimizer({
                parallel: true,
                exclude: ['node_modules'],
            }),
        ],
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            maxSize: 50000,
            minChunks: 2,
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    test: /\/node_modules\//,
                    name: getPackageName,
                },
            },
            automaticNameDelimiter: '-',
        },
        noEmitOnErrors: true,
        providedExports: false,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react',
                            ],
                            plugins: [
                                [
                                    '@babel/plugin-proposal-class-properties',
                                    { loose: true },
                                ],
                                '@babel/plugin-proposal-do-expressions',
                            ],
                            cacheDirectory: resolve(__dirname, 'cache'),
                        },
                    },
                ],
                include: [
                    resolve(__dirname, 'src/core'),
                    resolve(__dirname, 'src/UI'),
                ],
            },
            {
                test: /\.pcss$/,
                use: [
                    { loader: CSSPlugin.loader },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            minimize: true,
                            importLoaders: 1,
                            camelCase: 'dashes',
                            context: resolve(__dirname, 'src/UI'),
                            localIdentName: '[local]-[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                require('autoprefixer')({
                                    browsers: ['Chrome >= 60'],
                                }),
                                require('postcss-nested')({}),
                            ],
                        },
                    },
                ],
                include: [resolve(__dirname, 'src/UI')],
            },
        ],
    },
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new CSSPlugin({
            filename: '[name].css',
            chunkFilename: '[name]-[id].css',
        }),
        new Favicon({
            // https://github.com/haydenbleasel/favicons#usage
            logo: './src/UI/assets/favicon.png',
            prefix: 'favicons/',
            persistentCache: false,
            icons: {
                coast: false,
                yandex: false,
                favicons: true,
                firefox: false,
                twitter: false,
                android: false,
                windows: false,
                appleIcon: false,
                opengraph: false,
                appleStartup: false,
            },
        }),
        new HTMLPlugin({
            filename: 'index.html',
            title: getProjectName(),
            template: resolve(__dirname, 'src/UI/assets/template.html'),
        }),
    ],
};

const devServerHost = 'localhost';
const devServerPort = 9100;
const browserSyncPort = 9000;

const DEVELOPMENT = {
    ...PRODUCTION,
    optimization: {},
    devtool: 'source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new BrowserSync(
            {
                host: 'localhost',
                port: browserSyncPort,
                proxy: `http://${devServerHost}:${devServerPort}`,
                notify: false,
            },
            {
                name: 'BSP',
                reload: true,
                callback() {
                    Logger.log(
                        '[BROWSERSYNC]:',
                        `WDS working on ${devServerHost}:${devServerPort}.`,
                        `BS working on ${devServerHost}:${browserSyncPort}`,
                    );
                },
            },
        ),
        new CSSPlugin({
            filename: '[name].css',
            chunkFilename: '[name]-[id].css',
        }),
        new HTMLPlugin({
            filename: 'index.html',
            title: getProjectName(),
            template: resolve(__dirname, 'src/UI/assets/template.html'),
        }),
    ],
    devServer: {
        contentBase: resolve(__dirname, 'build'),
        hot: true,
        overlay: {
            errors: true,
            warnings: true,
        },
        host: devServerHost,
        port: devServerPort,
        proxy: {
            '/api': `http://${devServerHost}:${devServerPort}`,
        },
        stats: 'minimal',
    },
};

process.on('exit', code => {
    Logger.log('[WEBPACK]:', 'Good bye! Process was stopped with code:', code);
});

module.exports = (_, { mode }) => {
    Logger.log('[WEBPACK]:', `Hey there! We are working using "${mode}" mode`);
    switch (mode) {
        case 'production': {
            return PRODUCTION;
        }
        default:
        case 'development': {
            return DEVELOPMENT;
        }
    }
};
