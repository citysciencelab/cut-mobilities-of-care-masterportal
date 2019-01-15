const merge = require("webpack-merge"),
    // auskommentieren um eine grafische Darstellung vom bundle als html zu erzeugen
    // Visualizer = require("webpack-visualizer-plugin"),
    Common = require("./webpack.common.js"),
    proxies = require("lgv-config/proxyconf.json"),
    _ = require("underscore");

module.exports = function (env, args) {
    const path2CustomModule = _.isString(args.CUSTOMMODULE) && args.CUSTOMMODULE !== "" ? args.CUSTOMMODULE : "";

    return merge.smart({
        mode: "development",
        devtool: "cheap-module-eval-source-map",
        devServer: {
            port: 9001,
            publicPath: "/build/",
            overlay: true,
            https: true,
            open: true,
            openPage: "portal/master",
            proxy: proxies
        },
        module: {
            rules: [
                // Glyphicons werden von bootstrap gelesen
                {
                    test: /glyphicons-halflings-regular\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../node_modules/bootstrap/fonts"
                    }
                },
                // alle anderen Schriftarten werden von lgv-config gelesen
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../node_modules/lgv-config/css/woffs"
                    }
                }
            ]
        }
        // auskommentieren um eine grafische Darstellung vom bundle als html unter "build/statistics.html" zu erzeugen
        // plugins: [
        //     new Visualizer({
        //         filename: "./statistics.html"
        //     })
        // ]
    }, new Common(path2CustomModule));
};
