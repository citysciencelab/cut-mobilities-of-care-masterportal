const merge = require("webpack-merge"),
    // auskommentieren um eine grafische Darstellung vom bundle als html zu erzeugen
    // Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js"),
    proxies = require("lgv-config/proxyconf.json"),
    _ = require("underscore");

module.exports = function (env, args) {
    let path2CustomModule = _.isString(args.CUSTOMMODULE) && args.CUSTOMMODULE !== "" ? args.CUSTOMMODULE : "";

    return merge(new common(path2CustomModule), {
        mode: "development",
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
    })
};