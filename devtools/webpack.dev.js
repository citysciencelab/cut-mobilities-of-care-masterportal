const merge = require("webpack-merge"),
    // auskommentieren um eine grafische Darstellung vom bundle als html zu erzeugen
    // Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js"),
    proxies = require("lgv-config/proxyconf.json"),
    proxiesPublic = require("lgv-config-public/proxyconf.json");

proxies = function replaceProxyConf () {
    return proxies === undefined ? proxiesPublic : proxies;
};

module.exports = merge(common, {
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


});
