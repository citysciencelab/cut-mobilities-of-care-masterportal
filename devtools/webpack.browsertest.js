/* eslint-disable no-sync */
/* eslint-disable global-require */
/* eslint-disable no-console */
const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    Mocha = require("mocha"),
    mocha = new Mocha({
        exit: true,
        reporter: "list"
    }),
    fse = require("fs-extra");

let proxies;

if (fse.existsSync("./devtools/proxyconf.json")) {
    proxies = require("./proxyconf.json");
}
else {
    proxies = require("./proxyconf_example.json");
}


module.exports = function (env, args) {
    const path2Addon = typeof args.ADDON === "string" && args.ADDON !== "" ? args.ADDON : "";

    return merge.smart({
        mode: "development",
        devtool: "eval-cheap-module-source-map",
        devServer: {
            port: 9001,
            publicPath: "/build/",
            overlay: true,
            open: true,
            https: true,
            openPage: "portal/master",
            proxy: proxies
        },
        module: {
            rules: [
                // Glyphicons werden von bootstrap gelesen
                {
                    test: /glyphicons-halflings-regular\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../node_modules/bootstrap/fonts"
                    }
                },
                // alle anderen Schriftarten
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]"
                    }
                }
            ]
        },
        plugins: [
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {

                        /* eslint-disable-next-line no-process-env */
                        if (process.env.NODE_ENV === "e2eTest") {
                            console.log("after emitting AfterEmitPlugin: starting e2e-tests");
                            mocha.addFile("./test/end2end/TestRunner.js");
                            // exit with non-zero status if there were test failures
                            /* eslint-disable-next-line no-return-assign */
                            mocha.run(failures => process.exitCode = failures ? 1 : 0)
                                .on("test", function (test) {
                                    console.log("Test started: " + test.title);
                                })
                                .on("test end", function (test) {
                                    console.log("Test done: " + test.title);
                                })
                                .on("pass", function (test) {
                                    console.log("Test passed");
                                    console.log(test);
                                })
                                .on("fail", function (test, err) {
                                    console.log("Test fail");
                                    console.log(test);
                                    console.log(err);
                                })
                                .on("end", function () {
                                    console.log("All done");
                                });
                        }
                    });
                }
            }
        ]
    }, new Common(path2Addon));
};
