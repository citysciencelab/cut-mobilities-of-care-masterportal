const Chunks2JsonPlugin = require("chunks-2-json-webpack-plugin"),
    webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path"),
    fs = require("fs"),
    portalconfigsPath = path.resolve(__dirname, "../portalconfigs/"),
    customModuleConfigPath = path.resolve(portalconfigsPath, "customModules", "customModulesConf.json"),
    entryPoint = {masterportal: path.resolve(__dirname, "../js/main.js")};

if (!fs.existsSync(customModuleConfigPath)) {
    console.error("---\n---");
    throw new Error("ERROR: NO CUSTOM MODULE CONFIG FILE FOUND AT \"" + customModuleConfigPath + "\"\nABORTED...");
}
const portalEntryPoints = require(customModuleConfigPath);

module.exports = function () {
    const customModulesRelPaths = {};

    for (const portalName in portalEntryPoints) {

        if (typeof portalEntryPoints[portalName] !== "string") {
            console.error("---\n---");
            throw new Error("ERROR: WRONG ENTRY IN \"" + customModuleConfigPath + "\" at key \"" + portalName + "\"\nABORTED...");
        }

        const customModuleFilePath = path.resolve([portalconfigsPath, "customModules", portalName, portalEntryPoints[portalName]].join("/") + ".js");

        if (!fs.existsSync(customModuleFilePath)) {
            console.error("---\n---");
            throw new Error("ERROR: FILE DOES NOT EXIST \"" + customModuleFilePath + "\"\nABORTED...");
        }

        customModulesRelPaths[portalName] = [portalName, portalEntryPoints[portalName]].join("/");
    }

    return {
        entry: entryPoint,
        stats: {
            all: false,
            assets: true,
            //chunkModules: true,
            colors: true,
            entrypoints: true,
            //modules: true,
            outputPath: true
        },
        optimization: {
            splitChunks: {
                minSize: 0,
                maxInitialRequests: Infinity,
                cacheGroups: {
                    /*
                    vendor: {
                        test: /node_modules/,
                        chunks: "all",
                        name: "vendor"
                        enforce: true
                    }
                    */
                }
            }
        },
        output: {
            path: path.resolve(__dirname, "../build/"),
            filename: "js/[name].js",
            publicPath: "../../build/"
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
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                            }
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
        plugins: [
            new Chunks2JsonPlugin({outputDir: "dist/__wp_chunks/"}),
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
                filename: "css/[name].css"
            }),
            // import only de-locale from momentjs
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
            // create global constant at compile time
            new webpack.DefinePlugin({
                CUSTOMMODULES: JSON.stringify(customModulesRelPaths)
            })
        ]
    };
};
