require("dotenv").config();
require("./fixes");

const webdriver = require("selenium-webdriver"),
    path = require("path"),
    http = require("http"),
    tests = require(path.resolve(__dirname, "./tests.js")),
    {
        getBsCapabilities,
        capabilities,
        resolutions,
        configs,
        modes
    } = require("./settings"),
    /* eslint-disable no-process-env */
    browser = process.env.browser || "chrome",
    browserstackuser = process.env.bs_user,
    browserstackkey = process.env.bs_key,
    proxy = process.env.proxy || "",
    url = process.env.url || "http://localhost:9001";
    /* eslint-enable no-process-env */

// pulling execution to separate function for JSDoc; expected input is e.g. "chrome", "bs", "chrome,firefox"
runTests(browser.split(","));

/**
 * Constructs all combinations-to-test of
 *     BROWSER x CONFIG x MODE x RESOLUTION
 * This is done for both local and browserstack testing.
 * @param {String[]} browsers should be ["bs"] for browserstack testing or an array of the browsers you test locally
 * @returns {void}
 */
function runTests (browsers) {
    browsers.forEach(currentBrowser => {
        configs.forEach((pathEnd, config) => {
            const completeUrl = url + pathEnd;

            modes.forEach(mode => {
                if (currentBrowser !== "bs") {
                    const builder = new webdriver.Builder().withCapabilities(capabilities[currentBrowser]);

                    resolutions.forEach(resolution => {
                        tests(builder, completeUrl, currentBrowser, resolution, config, mode);
                    });
                }
                else {
                    const bsCapabilities = [].concat(...resolutions.map(r => getBsCapabilities(browserstackuser, browserstackkey, r)));

                    bsCapabilities.forEach(capability => {
                        const builder = new webdriver.Builder().
                            usingHttpAgent(new http.Agent({keepAlive: true})).
                            usingServer("http://hub-cloud.browserstack.com/wd/hub").
                            withCapabilities(capability).
                            usingWebDriverProxy(proxy);

                        tests(builder, completeUrl, "browserstack / " + capability.browserName, capability.resolution, config, mode);
                    });
                }
            });
        });
    });
}
