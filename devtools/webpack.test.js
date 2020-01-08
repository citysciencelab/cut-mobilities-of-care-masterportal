var webpack = require("webpack"),
    path = require("path");

require("jsdom-global")();
global.DOMParser = window.DOMParser;

module.exports = {
    target: "node",
    mode: "development",
    resolve: {
        alias: {
            "@modules": path.resolve(__dirname, "../modules"),
            "@addons": path.resolve(__dirname, "../addons"),
            "@testUtil": path.resolve(__dirname, "../test/unittests/Util"),
            "@portalconfigs": path.resolve(__dirname, "../portalconfigs")
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
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"],
                    plugins: ["@babel/plugin-syntax-dynamic-import"]
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
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            i18next: ["i18next/dist/cjs/i18next.js"],
            _: "underscore",
            Config: path.resolve(__dirname, "../test/unittests/deps/testConfig"),
            XMLSerializer: path.resolve(__dirname, "../test/unittests/deps/testXmlSerializer"),
            fs: "fs",
            requestAnimationFrame: "raf"
        }),
        new webpack.NormalModuleReplacementPlugin(/^mqtt$/, "mqtt/dist/mqtt.js")
    ]
};
