const VueLoaderPlugin = require("vue-loader/lib/plugin"),
    nodeExternals = require("webpack-node-externals");

require("jsdom-global")();

module.exports = {
    mode: "development",
    externals: [nodeExternals()],
    devtool: "inline-cheap-module-source-map",
    output: {
        // use absolute paths in sourcemaps (important for debugging via IDE)
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        devtoolFallbackModuleFilenameTemplate: "[absolute-resource-path]?[hash]"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /\bcore-js\b/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.vue$/,
                use: "vue-loader"
            },
            {
                test: /\.(le|c|sa)ss$/,
                use: "null-loader"
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};
