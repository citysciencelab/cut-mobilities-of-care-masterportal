var webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path"),
    test = "../portalconfigs/verkehrsportal/verkehrsfunctions.js";

module.exports = {
    entry: {
        masterportal: "./js/main.js"
        // customModule: test
    },
    output: {
        path: path.resolve(__dirname, "../build"),
        filename: "js/[name].js"
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
                exclude: /(node_modules)/,
                include: [
                    path.resolve(__dirname, test)
                ],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-syntax-dynamic-import"]
                    }
                },
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
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    publicPath: "../../node_modules/lgv-config/css/woffs"
                }
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
        }),
        // create css under build/
        new MiniCssExtractPlugin({
            filename: "css/style.css"
        }),
        // import only de-locale from momentjs
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
        new webpack.ContextReplacementPlugin(/testtest/, /.\/portalconfigs\/verkehrsportal\/verkehrsfunctions.js/)
    ]
};
