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
                use: "babel-loader"
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
            Config: path.resolve(__dirname, "../test/unittests/deps/testConfig"),
            XMLSerializer: path.resolve(__dirname, "../test/unittests/deps/testXmlSerializer"),
            fs: "fs",
            requestAnimationFrame: "raf"
        }),
        new webpack.NormalModuleReplacementPlugin(/^mqtt$/, "mqtt/dist/mqtt.js")
    ]
};
