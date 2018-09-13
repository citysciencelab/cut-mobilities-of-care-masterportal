const merge = require("webpack-merge"),
    Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    watch: true,
    plugins: [
        new Visualizer({
            filename: "./statistics.html"
        })
    ]
});
