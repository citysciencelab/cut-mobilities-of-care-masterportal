const merge = require("webpack-merge"),
    Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js"),
    proxies = require("lgv-config/proxyconf.json");

module.exports = function (env, args) {
    let path2CustomModule = args.CUSTOMMODULE ? args.CUSTOMMODULE : "";

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
        plugins: [
            new Visualizer({
                filename: "./statistics.html"
            })
        ]
    })
};
