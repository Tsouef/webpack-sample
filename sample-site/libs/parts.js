const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const StyleLintPlugin = require('stylelint-webpack-plugin');

// Lance un serveur pour dev avec la commande webpack-dev-server
exports.devServer = function(options) {
    return {
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        devServer: {
            proxy: {
                '/api': {
                    target: 'http://api.letudiant.lh/',
                    secure: false
                }
            },
            publicPath: '/',
            historyApiFallback: true,
            hot: true,
            stats: 'errors-only',
            host: options.host, // Defaults to `localhost`
            port: options.port // Defaults to 8080
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.WatchIgnorePlugin([
                path.join(__dirname, 'node_modules')
            ])
        ]
    };
};

exports.lintJavaScript = function(paths) {
    return {
        module: {
            rules: [
                {
                    test: /\.(js|jsx|es6)$/,
                    exclude: /node_modules/,
                    include: paths,
                    use: 'eslint-loader',
                    enforce: 'pre'
                }
            ]
        }
    };
};

// exports.lintCSS = function(options) {
//     return {
//         plugins: [
//             new StyleLintPlugin(options),
//         ]
//     }
// };

exports.minifyJavaScript = function(sourceMap) {
    return {
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                beautify: false, // Eliminate comments
                comments: false,
                compress: {
                    warnings: false,
                    drop_console: true
                },
                mangle: {
                    except: ['$'],
                    screw_ie8 : true,
                    keep_fnames: true
                }
            })
        ]
    };
};

exports.clean = function(path) {
    return {
        plugins: [
            new CleanWebpackPlugin(([ path ]), {
                root: process.cwd()
            })
        ]
    };
};

exports.setFreeVariable = function(key, value) {
    const env = {};
    env[key] = JSON.stringify(value);
    return {
        plugins: [
            new webpack.DefinePlugin(env)
        ]
    };
};

exports.loadJavaScript = function() {
    return {
        module: {
            rules: [
                {
                    test: /\.(js|jsx|es6)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            [
                                "es2015", {
                                "modules": false
                            }
                            ],
                            "stage-0",
                            "react"
                        ],
                        cacheDirectory: true
                    }
                }
            ]
        }
    }
};

exports.loadCSS = function(paths) {
    return {
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: ['style-loader?sourceMap', 'css-loader?sourceMap', 'sass-loader?sourceMap'],
                    include: paths,
                }
            ]
        }
    };
};

exports.loadJSON = function() {
    return {
        module: {
            rules: [
                {
                    test: /\.json$/,
                    loader: "json-loader"
                }
            ]
        }
    };
};

exports.loadHandlebars = function() {
    return {
        module: {
            rules: [
                {
                    test: /\.hbs/,
                    loader: "handlebars-loader",
                }
            ]
        }
    };
};

exports.extractBundles = function() {
    return {
        // Define an entry point needed for splitting.
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (module, count) => {
                    const userRequest = module.userRequest;
                    // You can perform other similar checks here too.
                    // Now we check just node_modules.
                    return userRequest && userRequest.indexOf('node_modules') >= 0;
                }
            })
        ]
    };
};

exports.extractCSS = function(paths) {
    return {
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    include: paths,
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: ['css-loader', 'sass-loader']
                    })
                }
            ]
        },
        plugins: [
            // Output extracted CSS to a file
            new ExtractTextPlugin('[name].css')
        ] };
};

exports.purifyCSS = function(paths) {
    paths = Array.isArray(paths) ? paths : [paths];
    return {
        plugins: [
            new PurifyCSSPlugin({
                basePath: '/',
                paths: paths.map(path => `${path}/*`),
                resolveExtensions: ['.html']
            })
        ]
    };
};

exports.generateSourcemaps = function(type) {
    return {
        devtool: type
    };
};

exports.CompressionGZIP = function() {
    return {
        plugins: [
            new CompressionPlugin({
                asset: "[path].gz[query]",
                algorithm: "gzip",
                test: /\.js$|\.html$/,
                threshold: 10240,
                minRatio: 0.8
            })
        ]
    }
}




