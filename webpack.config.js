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
const getPackageName = ({ context }) => 'npm.' + context.match(/\/node_modules\/(.*?)(\/|$)/)[1].replace('@', '');

/**
 * Prepared list of pages html-templates processors
 */
const HTMLProcessors = [
    new HTMLPlugin({
        filename: 'index.html',
        title: getProjectName(),
        template: resolve(__dirname, 'src/assets/application_template.html'),
    }),
    new HTMLPlugin({
        filename: 'instruction.html',
        title: getProjectName() + ' Manual',
        template: resolve(__dirname, 'src/assets/instruction_template.html'),
    }),
];

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
        application: resolve(__dirname, 'src/index.jsx'),
        instruction: resolve(__dirname, 'src/instruction.jsx'),
    },
    output: {
        path: resolve(__dirname, 'build'),
        filename: '[name]-[hash:10].js',
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
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: [
                                ['@babel/plugin-proposal-class-properties', { loose: true }],
                                '@babel/plugin-proposal-do-expressions',
                            ],
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
                test: /\.(svg|png|jpg|jpeg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'assets',
                            name: '[name].[hash].[ext]',
                        },
                    },
                ],
                include: [resolve(__dirname, 'src')],
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
            logo: './src/assets/favicon.png',
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
        ...HTMLProcessors,
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
                callback() {
                    console.log(
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
        ...HTMLProcessors,
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
