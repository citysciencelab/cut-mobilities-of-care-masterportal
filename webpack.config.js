var webpack = require("webpack"),
    path = require("path");

module.exports = {
    entry: "./js/main.js",
    mode: "development",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.js"
    }
};
