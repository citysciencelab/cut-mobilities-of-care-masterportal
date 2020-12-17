const webpack = require("webpack"),
    VueLoaderPlugin = require("vue-loader/lib/plugin");

require("regenerator-runtime/runtime");
require("jsdom-global")();
require("proj4");

global.DOMParser = window.DOMParser;

module.exports = {
    mode: "development",
    devtool: "inline-cheap-module-source-map",
    output: {
        // use absolute paths in sourcemaps (important for debugging via IDE)
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        devtoolFallbackModuleFilenameTemplate: "[absolute-resource-path]?[hash]"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /\bcore-js\b/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.vue$/,
                use: "vue-loader"
            },
            {
                test: /\.(le|c|sa)ss$/,
                use: "null-loader"
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            // _: "underscore",
            i18next: ["i18next/dist/cjs/i18next.js"]
            // Config: path.resolve(__dirname, "../test/unittests/deps/testConfig"),
            // XMLSerializer: path.resolve(__dirname, "../test/unittests/deps/testXmlSerializer"),
            // fs: "fs",
            // requestAnimationFrame: "raf"
        }),
        new VueLoaderPlugin()
    ],
    node: {
        fs: "empty"
    }
};
