const webpack = require("webpack"),
    path = require("path"),
    VueLoaderPlugin = require("vue-loader/lib/plugin");

require("regenerator-runtime/runtime");
require("jsdom-global")();
global.DOMParser = window.DOMParser;

URL.createObjectURL = function () {
    return false;
};

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
                exclude: /\bcore-js\b|\bvideo.js\b|\bsinon\b|\bturf\b/,
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
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader"
                    }
                ]
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
        new webpack.NormalModuleReplacementPlugin(/^mqtt$/, "mqtt/dist/mqtt.js"),
        // ADDONS wird hier global definiert, da der pre-push den Fehler ADDONS is undefined in ./src/addons.js wirft,
        // obwohl der linter die Zeile ignorieren soll
        new webpack.DefinePlugin({
            ADDONS: {},
            VUE_ADDONS: {}
        })
    ]
};
