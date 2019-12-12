const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    path = require("path"),

    rootPath = path.resolve(__dirname, "../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))();

module.exports = function () {
    return merge.smart(new Common(), {
        mode: "production",
        output: {
            path: path.resolve(__dirname, "../dist/build"),
            filename: "js/[name].js",
            publicPath: "../mastercode/" + stableVersionNumber + "/"
        },
        module: {
            rules: [
                // alle Schriftarten (auch die Glyphicons) kommen in lokalen Ordner
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "css/woffs/",
                        publicPath: "./woffs/"
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
