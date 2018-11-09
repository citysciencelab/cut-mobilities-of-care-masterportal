var webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path");

module.exports = {
    entry: "./js/main.js",
    output: {
        path: path.resolve(__dirname, "../build"),
        filename: "js/masterportal.js"
    },
    resolve: {
        alias: {
            text: "text-loader"
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/(node_modules)/, /(plugins)/],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader",
                    "less-loader"
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        // provide libraries globally
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            _: "underscore"
            // Cesium: "cesium/Cesium"
        }),
        // create css under build/
        new MiniCssExtractPlugin({
            filename: "css/style.css"
        }),
        // import only de-locale from momentjs
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/)
        // new webpack.DefinePlugin({
        //     // Define relative base path in cesium for loading assets
        //     CESIUM_BASE_URL: JSON.stringify("../../node_modules/cesium/Source")
        // })
    ]
};
