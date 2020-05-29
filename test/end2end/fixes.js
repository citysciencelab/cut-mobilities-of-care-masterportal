const portprober = require("../../node_modules/selenium-webdriver/net/portprober"),
    net = require("net");

/*
 * fix for "random permission problem" on Windows (happens occasionally in FF)
 * https://github.com/SeleniumHQ/selenium/issues/7097
 * fix is merged, but not published yet
 * TODO this fix does not work currently; EACCES may throw locally
 */
portprober.isFree = function (port, opt_host) {
    return new Promise((resolve, reject) => {
        const server = net.createServer().on("error", function (e) {
            if (e.code === "EADDRINUSE" || e.code === "EACCES") {
                resolve(false);
            }
            else {
                reject(e);
            }
        });

        server.listen(port, opt_host, function () {
            server.close(() => resolve(true));
        });
    });
};
