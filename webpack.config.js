var webpack = require("webpack"),
    path = require("path");

module.exports = {
    entry: "./js/main.js",
    mode: "development",
    watch: true,
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.js"
    },
    resolve: {
        alias: {
            text: "text-loader",
            "@app": path.resolve(__dirname, "portal/master")
        }
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
