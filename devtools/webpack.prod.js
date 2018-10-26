const merge = require("webpack-merge"),
    Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js"),
    _ = require("underscore"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    path = require("path");

module.exports = function (env, args) {
    let path2CustomModule = _.isString(args.CUSTOMMODULE) && args.CUSTOMMODULE !== "" ? args.CUSTOMMODULE : "";

    return merge(new common(path2CustomModule), {
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
    })
};