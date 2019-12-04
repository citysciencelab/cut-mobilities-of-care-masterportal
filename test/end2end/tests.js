const modulesControlsZoomTests = require("./tests/modules/controls/Zoom.js"),
    modulesControlsFullScreenTests = require("./tests/modules/controls/FullScreen.js"),
    panTests = require("./tests/Pan.js"),
    zoomTests = require("./tests/Zoom.js");

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} e2eTestParams
 * @property {selenium-webdriver.Builder} builder fully prepared builder that can be used for instantiation
 * @property {String} url to open Masterportal with
 * @property {String} resolution as WIDTHxHEIGHT
 * @property {String} config key that defines which config the Masterportal should run on
 * @property {String} mode key that defines which steps should be taken before testing (e.g. activating 3D)
 * @property {String} browsername string indicating which browser is in use
 */

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

    describe(`MasterTests in ${browsername} (mode=${mode},resolution=${resolution},config=${config})`, function () {
        this.timeout(150000);

        const e2eTestParams = {builder, url, resolution, config, mode, browsername};

        // modules/controls
        modulesControlsZoomTests(e2eTestParams);
        modulesControlsFullScreenTests(e2eTestParams);

        // non-module tests
        panTests(e2eTestParams);
        zoomTests(e2eTestParams);
    });
}

module.exports = tests;
