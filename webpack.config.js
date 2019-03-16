const { resolve } = require('path');

const webpack = require('webpack');
const CSSPlugin = require('mini-css-extract-plugin');
const JSMinimizer = require('terser-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const BrowserSync = require('browser-sync-webpack-plugin');

const PLUGINS = [
    new CSSPlugin({
        filename: '[name].css',
        chunkFilename: '[name]-[id].css',
    }),
    new HTMLPlugin({
        filename: 'index.html',
        template: resolve(__dirname, 'src/assets/main_template.html'),
        chunks: ['main'],
    }),
    new HTMLPlugin({
        filename: 'manual.html',
        template: resolve(__dirname, 'src/assets/manual_template.html'),
        chunks: ['manual'],
    }),
];

const PRODUCTION = {
    entry: {
        main: resolve(__dirname, 'src/pages/main/main.jsx'),
        manual: resolve(__dirname, 'src/pages/manual/manual.jsx'),
    },
    output: {
        path: resolve(__dirname, 'docs'),
        filename: '[name].js',
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['node_modules', resolve(__dirname, 'src')],
        alias: {
            components: resolve(__dirname, 'src/components'),
        },
    },
    optimization: {
        minimizer: [
            new JSMinimizer({
                parallel: true,
                cache: true,
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
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
                            cacheDirectory: resolve(__dirname, 'cache'),
                        },
                    },
                ],
                include: [resolve(__dirname, 'src')],
            },
            {
                test: /\.worker\.js$/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: { inline: true },
                    },
                ],
                include: [resolve(__dirname, 'src')],
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
                            context: resolve(__dirname, 'src'),
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
                include: [resolve(__dirname, 'src')],
            },
            {
                test: /\.gif$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets',
                        },
                    },
                ],
                include: [resolve(__dirname, 'src')],
            },
        ],
    },
    plugins: [new webpack.HashedModuleIdsPlugin(), ...PLUGINS],
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
                callback() {
                    console.log(
                        '[BROWSERSYNC]:',
                        `WDS working on ${devServerHost}:${devServerPort}.`,
                        `BS working on ${devServerHost}:${browserSyncPort}`,
                    );
                },
            },
        ),
        ...PLUGINS,
    ],
    devServer: {
        host: devServerHost,
        port: devServerPort,
        contentBase: resolve(__dirname, 'docs'),
        hot: true,
        overlay: {
            errors: true,
            warnings: true,
        },
    },
};

process.on('exit', code => {
    console.log('[WEBPACK]:', 'Good bye! Process was stopped with code:', code);
});

module.exports = (_, { mode }) => {
    console.log('[WEBPACK]:', `Hey there! We are working using "${mode}" mode`);
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
