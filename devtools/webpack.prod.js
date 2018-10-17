const merge = require("webpack-merge"),
    Visualizer = require("webpack-visualizer-plugin"),
    common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "production",
    plugins: [
        new Visualizer({
            filename: "./prodstatistics.html"
        })
    ]
});
