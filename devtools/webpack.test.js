const webpack = require("webpack"),
    path = require("path"),
    VueLoaderPlugin = require("vue-loader/lib/plugin");

require("jsdom-global")();
global.DOMParser = window.DOMParser;

module.exports = {
    target: "node",
    mode: "development",
    resolve: {
        alias: {
            "@modules": path.resolve(__dirname, "../modules"),
            "@addons": path.resolve(__dirname, "../addons"),
            "@testUtil": path.resolve(__dirname, "../test/unittests/Util")
        }
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                use: "node-loader"
            },
            {
                test: /\.js$/,
                exclude: /\bcore-js\b/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        js: "babel-loader?presets[]=env"
                    }
                }
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                }
            },
            {
                test: /\.(le|c|sa)ss$/,
                use: "null-loader"
            },
            {
                test: /\.xml$/i,
                use: "raw-loader"
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            _: "underscore",
            i18next: ["i18next/dist/cjs/i18next.js"],
            Config: path.resolve(__dirname, "../test/unittests/deps/testConfig"),
            XMLSerializer: path.resolve(__dirname, "../test/unittests/deps/testXmlSerializer"),
            fs: "fs",
            requestAnimationFrame: "raf"
        }),
        new VueLoaderPlugin(),
        new webpack.NormalModuleReplacementPlugin(/^mqtt$/, "mqtt/dist/mqtt.js")
    ]
};
