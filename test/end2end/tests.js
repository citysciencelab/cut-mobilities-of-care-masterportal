const zoomtests = require("./modules/controls/Zoom.js");

/**
 * Test Runner. Will call all tests for a given set of parameters.
 * Tests are required to
 *     1. decide themselves if and which tests they run for this set of parameters
 *     2. decide themselves how to use the builder as long as any produced driver is also quit
 *     3. prepare resolution and mode themselves (helper functions in lib/driver)
 * @param {selenium-webdriver.Builder} builder fully prepared builder that can be used for instantiation
 * @param {String} url to open Masterportal with
 * @param {String} browsername to display in logging
 * @param {String} resolution in format AxB with A, B being integers
 * @param {String} config key that defines which config the Masterportal should run on
 * @param {String} mode key that defines which steps should be taken before testing (e.g. activating 3D)
 * @returns {void}
 */
function tests (builder, url, browsername, resolution, config, mode) {
    afterEach(function (done) {
        // TODO remove eventually - I'm using this to watch the webdriver interactions - DSE
        setTimeout(done, 500);
    });

    describe(`MasterTests in ${browsername} (mode=${mode},resolution=${resolution},config=${config})`, async function () {
        this.timeout(150000);

        // --- Zoom ---
        await zoomtests(builder, url, resolution, config, mode);

        // // --- Search ---
        // suchtests(driver);

        // // --- Controls ---
        // controltests(driver);

        // // --- Themenbaum ---
        // themenbaumlighttests(driver);

        // // --- ParametricUrl ---
        // parametricUrlTests(driver);
    });
}

module.exports = tests;
