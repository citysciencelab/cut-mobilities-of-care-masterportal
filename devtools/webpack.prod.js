const merge = require("webpack-merge"),
    common = require("./webpack.common.js"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    path = require("path");

module.exports = merge(common, {
    mode: "production",
    output: {
        path: path.resolve(__dirname, "../dist/build"),
        filename: "js/masterportal.js"
    },
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "css/woffs/"
                }
            }
        ]
    },
    optimization: {
        minimizer: [new UglifyJsPlugin()]
    },
    stats: "errors-only"
});
