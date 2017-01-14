const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const parts = require('./libs/parts');

const PATHS = {
    app: path.join(__dirname, 'app'),
    style: path.join(__dirname, 'app/scss' , 'style.scss'),
    build: path.join(__dirname, 'build'),
};

const common = merge(
    {
        entry: {
            hmr: [
                'webpack-dev-server/client?http://localhost:8080',
                'webpack/hot/only-dev-server'
            ],
            app: PATHS.app + '/app.js',
            style: PATHS.style
        },

        output: {
            path: PATHS.build,
            filename: '[name].js',
            sourceMapFilename: '[file].map',
            devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
        },

        plugins: [
            new HtmlWebpackPlugin({
                title: 'Webpack demo'
            })
        ],

        node:{
            'fs' : 'empty'
        },

        resolve: {
            modules: [
                "node_modules",
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, '../sample-modules')
            ],
            extensions: [".js", ".json", ".jsx", ".css", ".scss", ".hbs"],
        },

        resolveLoader: {
            modules: [
                "node_modules",
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, '../sample-modules')
            ],
        }
    },

    parts.lintJavaScript(PATHS.app)
);

module.exports = function(env) {
    if (env === 'production') {
        return merge(
            common,
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.loadJavaScript(PATHS.app),
            parts.minifyJavaScript('source-map'),
            parts.extractBundles(),
            parts.clean(PATHS.build),
            parts.generateSourcemaps('source-map'),
            parts.extractCSS(PATHS.style),
            parts.purifyCSS(PATHS.style),
            parts.CompressionGZIP()
        );
    }

    return merge(
        common,
        {
            performance: {
                hints: false
            },
            plugins: [
                new webpack.NamedModulesPlugin()
            ]
        },

        parts.loadJavaScript(PATHS.app),
        parts.loadJSON(),
        parts.loadHandlebars(),
        parts.loadCSS(),
        parts.generateSourcemaps('eval-source-map'),
        parts.devServer({
            host: process.env.HOST,
            port: process.env.PORT
        })
    );



};