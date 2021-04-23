require("dotenv").config();
require("./fixes");

const webdriver = require("selenium-webdriver"),
    webdriverProxy = require("selenium-webdriver/proxy"),
    webdriverChrome = require("selenium-webdriver/chrome"),
    path = require("path"),
    http = require("http"),
    tests = require(path.resolve(__dirname, "./tests.js")),
    {
        getCapabilities,
        capabilities,
        resolutions,
        configs,
        modes
    } = require("./settings"),
    /* eslint-disable no-process-env */
    testService = process.env.npm_config_testservice,
    browser = process.env.browser || "firefox,chrome",
    url = process.env.url || "https://localhost:9001/",
    urlPart = process.env.urlPart || "portal/",
    // proxy for browserstack
    proxy = process.env.proxy || "",
    // proxy for local testing
    localHttpProxy = process.env.http_proxy,
    localHttpsProxy = process.env.https_proxy,
    localBypassList = ["localhost", "127.0.0.1", "10.*", "geodienste.hamburg.de", "test-geodienste.hamburg.de"];
    /* eslint-enable no-process-env */

// pulling execution to separate function for JSDoc; expected input is e.g. "chrome", "bs", "chrome,firefox"
runTests(browser.split(","));

/**
 * Removes protocol prefix, if present.
 * @param {string} proxyUrl proxy url
 * @returns {string} proxy url without leading http/https
 */
function cleanProxyUrl (proxyUrl) {
    return proxyUrl.includes("//") ? proxyUrl.split("//")[1] : proxyUrl;
}

/**
 * Adds proxy to builder for local testing.
 * @param {string} currentBrowser name of current browser
 * @param {object} builder given builder
 * @returns {void}
 */
function setLocalProxy (currentBrowser, builder) {
    if (currentBrowser === "chrome") {
        let options = new webdriverChrome.Options();

        options = options.addArguments(`--proxy-server=${localHttpProxy}`);
        options = options.addArguments(`--proxy-bypass-list=${localBypassList.join(",")}`);
        options = options.addArguments("--ignore-certificate-errors");
        options = options.addArguments("--ignore-ssl-errors");
        if (testService === undefined) {
            options = options.addArguments("--no-sandbox");
        }
        builder.setChromeOptions(options);
    }
    else {
        builder.setProxy(
            webdriverProxy.manual({
                http: cleanProxyUrl(localHttpProxy),
                https: cleanProxyUrl(localHttpsProxy),
                bypass: localBypassList
            })
        );
    }
}

/**
 * Constructs all combinations-to-test of
 *     BROWSER x CONFIG x MODE x RESOLUTION
 * This is done for both local and SauceLabs testing.
 * @param {String[]} browsers should be ["fromCapabilities"] for getting browsers from capabilities or an array of the browsers you test locally
 * @returns {void}
 */
function runTests (browsers) {
    const date = new Date().toLocaleString();
    let build = "localhost";


    /* eslint-disable-next-line no-process-env */
    if (process.env.BITBUCKET_BRANCH) {
        /* eslint-disable-next-line no-process-env */
        build = "branch: " + process.env.BITBUCKET_BRANCH + " - commit: " + process.env.BITBUCKET_COMMIT + " - date:" + date;
        console.warn("Running tests on " + testService + " with name:\"" + build + "\" on Urls:");
    }

    browsers.forEach(currentBrowser => {
        configs.forEach((pathEnd, config) => {
            let completeUrl = url + urlPart + pathEnd;

            modes.forEach(mode => {
                if (currentBrowser !== "fromCapabilities") {
                    const builder = new webdriver.Builder().withCapabilities(capabilities[currentBrowser]);

                    if (localHttpProxy || localHttpsProxy) {
                        setLocalProxy(currentBrowser, builder);
                    }

                    resolutions.forEach(resolution => {
                        tests(builder, completeUrl, currentBrowser, resolution, config, mode);
                    });
                }
                else {
                    const caps = getCapabilities(testService);

                    /* eslint-disable-next-line no-process-env */
                    if (process.env.BITBUCKET_BRANCH) {
                        /* eslint-disable-next-line no-process-env */
                        completeUrl += "_" + process.env.BITBUCKET_BRANCH.replace(/\//g, "_");
                        console.warn(completeUrl);
                    }

                    caps.forEach(capability => {
                        const builder = createBuilder(testService, capability, build);

                        resolutions.forEach(resolution => {
                            tests(builder, completeUrl, testService + "/ " + capability.browserName, resolution, config, mode, capability);
                        });
                    });
                }
            });
        });
    });
}

/**
 * Creates a webdriver.Builder for the given testService.
 * @param {String} testServiceName "browserstack" or "saucelabs"
 * @param {Object} capability browserstack or saucelabs configurations.
 * @param {String} buildName name of the build
 * @returns {Object} the webdriver.Builder
 */
function createBuilder (testServiceName, capability, buildName) {

    const builder = new webdriver.Builder();

    if (testServiceName === "browserstack") {
        builder.usingHttpAgent(new http.Agent({keepAlive: true}));
        builder.usingServer("http://hub-cloud.browserstack.com/wd/hub").
            usingWebDriverProxy(proxy);
        capability.build = buildName;
    }
    else {
        builder.usingServer("https://ondemand.eu-central-1.saucelabs.com/wd/hub");
        capability["sauce:options"].build = buildName;
    }
    builder.withCapabilities(capability);
    return builder;
}
