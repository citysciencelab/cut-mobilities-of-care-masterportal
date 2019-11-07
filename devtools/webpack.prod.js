const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    path = require("path");

module.exports = function () {
    return merge.smart(new Common(), {
        mode: "production",
        output: {
            path: path.resolve(__dirname, "../dist/build"),
            filename: "js/[name].js"
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
            minimizer: [new UglifyJsPlugin({
                // *** use this attribute to build masterportal.js without uglify ***
                // include: /\.min\.js$/
            })]
        },
        stats: {
            "children": false,
            "errorDetails": true
        }
    });
};
