var webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path"),
    fs = require("fs");

let path2CustomModules = "";

if (fs.existsSync("./customModules/customModulesConf.json")) {
    path2CustomModules = require("../customModules/customModulesConf.json");
}
module.exports = function () {
    const entryPoints = {},
        customModules = {};

    for (const entryPointKey in path2CustomModules) {
        const customModuleFilename = path2CustomModules[entryPointKey],
            customModulePath = "./customModules/" + customModuleFilename;

        if (fs.existsSync(customModulePath + ".js")) {
            entryPoints[entryPointKey] = customModulePath;
            customModules[entryPointKey] = customModuleFilename;
        }
        else {
            console.error("WARNING: IGNORED CUSTOM MODULE \"" + entryPointKey + "\"");
        }
    }

    entryPoints.masterportal = "./js/main.js";

    return {
        entry: entryPoints,
        output: {
            path: path.resolve(__dirname, "../build"),
            filename: "js/[name].js"
        },
        resolve: {
            alias: {
                text: "text-loader"
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: ["@babel/plugin-syntax-dynamic-import"]
                        }
                    }
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        "css-loader",
                        "less-loader"
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        "css-loader"
                    ]
                }
            ]
        },
        /*
        optimization: {
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: "styles",
                        test: /\.css$/,
                        chunks: "all",
                        enforce: true,
                    },
                },
            },
        },
        */
        plugins: [
            // provide libraries globally
            new webpack.ProvidePlugin({
                jQuery: "jquery",
                $: "jquery",
                Backbone: "backbone",
                Radio: "backbone.radio",
                _: "underscore"
            }),
            // create css under build/
            new MiniCssExtractPlugin({
                filename: "css/style.css"
                /* chunkFilename: "css/[id].css" */
            }),
            // import only de-locale from momentjs
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
            // create global constant at compile time
            new webpack.DefinePlugin({
                CUSTOMMODULES: JSON.stringify(customModules)
            })
        ]
    };
};
