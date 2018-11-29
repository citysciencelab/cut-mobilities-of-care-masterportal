var webpack = require("webpack"),
    path = require("path");

module.exports = {
    entry: "mocha-loader!./test/unittests/SpecRunner.js",
    output: {
        path: path.resolve(__dirname, "test"),
        filename: "bundle.js"
    },
    mode: "development",
    resolve: {
        alias: {
            "@modules": path.resolve(__dirname, "../modules"),
            "@testUtil": path.resolve(__dirname, "../test/unittests/Util")
        }
    },
    externals: {
        config: "Config"
    },
    devServer: {
        port: 9009,
        publicPath: "/test/",
        open: true,
        openPage: "test/unittests/Testrunner.html"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            _: "underscore"
        })
    ]
};
