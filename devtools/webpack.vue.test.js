const VueLoaderPlugin = require("vue-loader/lib/plugin"),
    nodeExternals = require("webpack-node-externals");

require("jsdom-global")();

module.exports = {
    mode: "development",
    externals: [nodeExternals()],
    devtool: "inline-cheap-module-source-map",
    output: {
        // todo inka debug testen
        // use absolute paths in sourcemaps (important for debugging via IDE)
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        devtoolFallbackModuleFilenameTemplate: "[absolute-resource-path]?[hash]"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-env"],
                    plugins: ["@babel/plugin-syntax-dynamic-import"]
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
