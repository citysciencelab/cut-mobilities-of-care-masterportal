/* eslint-disable no-process-env */
const webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path"),
    fse = require("fs-extra"),
    VueLoaderPlugin = require("vue-loader/lib/plugin"),

    rootPath = path.resolve(__dirname, "../"),
    addonPath = path.resolve(rootPath, "addons/"),
    addonConfigPath = path.resolve(addonPath, "addonsConf.json"),
    entryPoints = {masterportal: path.resolve(rootPath, "js/main.js")};

let addonEntryPoints = {};


if (!fse.existsSync(addonConfigPath)) {
    console.warn("NOTICE: " + addonConfigPath + " not found. Skipping all addons.");
}
else {
    addonEntryPoints = require(addonConfigPath);
}

module.exports = function () {
    const addonsRelPaths = {},
        vueAddonsRelPaths = {};

    for (const addonName in addonEntryPoints) {
        let vue = false;

        if (typeof addonEntryPoints[addonName] !== "string") {
            vue = addonEntryPoints[addonName].vue;
        }
        const entry = vue ? "index.js" : addonEntryPoints[addonName],
            addonFilePath = path.resolve(addonPath, addonName, entry);

        if (!fse.existsSync(addonFilePath)) {
            console.error("############\n------------");
            throw new Error("ERROR: FILE DOES NOT EXIST \"" + addonFilePath + "\"\nABORTED...");
        }

        if (vue) {
            vueAddonsRelPaths[addonName] = [addonName, "index.js"].join("/");
        }
        else {
            addonsRelPaths[addonName] = [addonName, addonEntryPoints[addonName]].join("/");
        }

    }

    return {
        entry: entryPoints,
        stats: {
            all: false,
            colors: true,
            errors: true,
            errorDetails: true
            // assets: true
            // chunkModules: true
            // entrypoints: true
            // modules: true
            // outputPath: true
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
                text: "text-loader",
                "variables": path.resolve(__dirname, "..", "css", "variables.less")
            }
        },
        module: {
            rules: [
                // ignore all files ending with ".test.js".
                {
                    test: /\.test\.js$/,
                    use: {
                        loader: "null-loader"
                    }
                },
                // take all files ending with ".js" but not with ".test.js".
                {
                    test: /\.js$/,
                    exclude: /\bcore-js\b|\.test\.js$/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {}
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
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                    options: {
                        loaders: {
                            js: "babel-loader?presets[]=env"
                        }
                    }
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    use: [
                        {
                            loader: "file-loader"
                        }
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
                i18next: ["i18next/dist/cjs/i18next.js"],
                _: "underscore"
            }),
            // create css under build/
            new MiniCssExtractPlugin({
                filename: "css/[name].css"
            }),
            new VueLoaderPlugin(),
            // import only de-locale from momentjs
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
            // create global constant at compile time
            new webpack.DefinePlugin({
                ADDONS: JSON.stringify(addonsRelPaths),
                VUE_ADDONS: JSON.stringify(vueAddonsRelPaths)
            }),
            // import only a very limited number of timezones
            // @see https://www.npmjs.com/package/moment-timezone-data-webpack-plugin
            new MomentTimezoneDataPlugin({
                matchZones: /Europe\/(Berlin|London)/,
                startYear: 2019,
                endYear: new Date().getFullYear()
            })
        ]
    };
};
