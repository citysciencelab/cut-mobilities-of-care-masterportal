const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    _ = require("underscore"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    path = require("path");

module.exports = function (env, args) {
    const path2CustomModule = _.isString(args.CUSTOMMODULE) && args.CUSTOMMODULE !== "" ? args.CUSTOMMODULE : "";

    return merge.smart(new Common(path2CustomModule), {
        mode: "production",
        output: {
            path: path.resolve(__dirname, "../dist/build"),
            filename: "js/masterportal.js"
        },
        module: {
            rules: [
                // alle Schriftarten (auch die Glyphicons) kommen in lokalen Ordner
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
        stats: {
            "children": false,
            "errorDetails": true
        }
    });
};
