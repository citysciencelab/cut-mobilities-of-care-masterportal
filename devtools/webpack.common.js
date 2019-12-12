const webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path"),
    fs = require("fs"),

    rootPath = path.resolve(__dirname, "../"),
    customModulePath = path.resolve(rootPath, "customModules/"),
    customModuleConfigPath = path.resolve(customModulePath, "customModulesConf.json"),
    portalconfigsIdaPath = path.resolve(rootPath, "portalconfigs/ida/main.js"),
    entryPoints = {masterportal: path.resolve(rootPath, "js/main.js")};

let customModuleEntryPoints = {};

if (!fs.existsSync(portalconfigsIdaPath)) {
    console.warn("NOTICE: " + portalconfigsIdaPath + " not found. Skipping entrypoint for \"IDA\"");
}
else {
    entryPoints.ida = portalconfigsIdaPath;
}

if (!fs.existsSync(customModuleConfigPath)) {
    console.warn("NOTICE: " + customModuleConfigPath + " not found. Skipping all custommodules.");
}
else {
    customModuleEntryPoints = require(customModuleConfigPath);
}

module.exports = function () {
    const customModulesRelPaths = {};

    for (const customModuleName in customModuleEntryPoints) {
        if (typeof customModuleEntryPoints[customModuleName] !== "string") {
            console.error("############\n------------");
            throw new Error("ERROR: WRONG ENTRY IN \"" + customModuleConfigPath + "\" at key \"" + customModuleName + "\"\nABORTED...");
        }

        const customModuleFilePath = path.resolve(customModulePath, customModuleName, customModuleEntryPoints[customModuleName]);

        if (!fs.existsSync(customModuleFilePath)) {
            console.error("############\n------------");
            throw new Error("ERROR: FILE DOES NOT EXIST \"" + customModuleFilePath + "\"\nABORTED...");
        }

        customModulesRelPaths[customModuleName] = [customModuleName, customModuleEntryPoints[customModuleName]].join("/");
    }

    return {
        entry: entryPoints,
        stats: {
            all: false,
            assets: true,
            // chunkModules: true,
            colors: true,
            entrypoints: true,
            // modules: true,
            outputPath: true
        },
        /*
        optimization: {
            splitChunks: {
                minSize: 0,
                maxInitialRequests: Infinity,
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: "all",
                        name: "vendor"
                        enforce: true
                    }
                }
            }
        },
        */
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
