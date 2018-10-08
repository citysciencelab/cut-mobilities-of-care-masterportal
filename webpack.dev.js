const merge = require("webpack-merge"),
    Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js"),
    proxies = require("lgv-config/proxyconf.json");


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
    plugins: [
        new Visualizer({
            filename: "./statistics.html"
        })
    ]
});
