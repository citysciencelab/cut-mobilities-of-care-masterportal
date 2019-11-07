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
            console.error("WARNING: FILE DOES NOT EXIST \"" + customModulePath + ".js\"");
        }
    }
    //     const customModuleFilenameJs = path2CustomModules[entryPointKey].js,
    //         customModuleFilenameLess = path2CustomModules[entryPointKey].less;
    //     let customModulePathJs,
    //         customModulePathLess;

    //     if (customModuleFilenameJs !== undefined) {
    //         customModulePathJs = "./customModules/" + customModuleFilenameJs;
    //         if (fs.existsSync(customModulePathJs + ".js")) {
    //             entryPoints[entryPointKey] = customModulePathJs;
    //             if (customModules[entryPointKey] === undefined) {
    //                 customModules[entryPointKey] = {};
    //             }
    //             customModules[entryPointKey].js = customModuleFilenameJs;
    //         }
    //         else {
    //             console.error("WARNING: FILE DOES NOT EXIST \"" + customModulePathJs + ".js\"");
    //         }
    //     }
    //     if (customModuleFilenameLess !== undefined) {
    //         customModulePathLess = "./customModules/" + customModuleFilenameLess;
    //         if (fs.existsSync(customModulePathLess + ".less")) {
    //             if (customModules[entryPointKey] === undefined) {
    //                 customModules[entryPointKey] = {};
    //             }
    //             customModules[entryPointKey].less = customModuleFilenameLess;
    //         }
    //         else {
    //             console.error("WARNING: FILE DOES NOT EXIST \"" + customModulePathLess + ".less\"");
    //         }
    //     }
    // }

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
                CUSTOMMODULES: JSON.stringify(customModules)
            })
        ]
    };
};
