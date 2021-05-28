require("dotenv").config();
require("./fixes");

/* eslint-disable no-process-env */
const webdriver = require("selenium-webdriver"),
    {
        getCapabilities
    } = require("./settings"),
    // name of the portal to test is contained
    portalName = process.env.npm_config_portalname,
    urlPart = process.env.urlPart.replace(/\\/g, ""),
    portalConfigs = new Map([
        [portalName, portalName]
    ]);

// pulling execution to separate function for JSDoc
runTests();

/**
 * Constructs all combinations-to-test.
 * This is done for sauceLabs testing.
 * @returns {void}
 */
function runTests () {
    const date = new Date().toLocaleString();
    let build = "localhost";


    if (process.env.BITBUCKET_BRANCH) {
        build = "branch: " + process.env.BITBUCKET_BRANCH + " - commit: " + process.env.BITBUCKET_COMMIT + " - date:" + date;
        console.warn("Running tests on saucelabs with name:\"" + build);
    }

    portalConfigs.forEach((pathEnd, config) => {
        const completeUrl = process.env.url + urlPart + pathEnd,
            caps = getCapabilities("saucelabs");

        console.warn("url:", completeUrl);
        caps.forEach(capability => {
            const builder = createBuilder(capability, build);

            tests(builder, completeUrl, capability.browserName, "1920x1080", config, "2D", capability);
        });
    });
}

/**
 * Creates a webdriver.Builder.
 * @param {Object} capability saucelabs configurations.
 * @param {String} buildName name of the build
 * @returns {Object} the webdriver.Builder
 */
function createBuilder (capability, buildName) {

    const builder = new webdriver.Builder();

    builder.usingServer("https://ondemand.eu-central-1.saucelabs.com/wd/hub");
    capability["sauce:options"].build = buildName;
    builder.withCapabilities(capability);
    return builder;
}

/**
 * Test Runner. Will call all tests for a given set of parameters.
 * @param {selenium-webdriver.Builder} builder fully prepared builder that can be used for instantiation
 * @param {String} url to open Masterportal with
 * @param {String} browsername to display in logging
 * @param {String} resolution in format AxB with A, B being integers
 * @param {String} config key that defines which config the Masterportal should run on
 * @param {String} mode key that defines which steps should be taken before testing (e.g. activating 3D)
 * @param {Object} capability containes saucelabs capability
 * @returns {void}
 */
function tests (builder, url, browsername, resolution, config, mode, capability) {
    describe(`${browsername} (${mode}, ${resolution}, ${config})`, function () {
        this.timeout(3600000);

        const suites = [
                require("../../src/tests/end2end/DeployedPortals.e2e.js")
            ],
            e2eTestParams = {builder, url, resolution, config, mode, browsername, capability};

        for (const suite of suites) {
            this.retries(2);
            suite(e2eTestParams);
        }
    });
}

