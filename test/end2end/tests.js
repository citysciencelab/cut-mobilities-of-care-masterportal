const // modulesControlsAttributionsTests = require("./tests/modules/controls/Attributions.js"),
    modulesControlsBackForwardTests = require("./tests/modules/controls/BackForward.js"),
    modulesControlsFreezeTests = require("./tests/modules/controls/Freeze.js"),
    // modulesControlsFullScreenTests = require("./tests/modules/controls/FullScreen.js"),
    modulesControlsOrientationTests = require("./tests/modules/controls/Orientation.js"),
    // modulesControlsOverviewMapTests = require("./tests/modules/controls/OverviewMap.js"),
    modulesControlsTotalViewTests = require("./tests/modules/controls/TotalView.js"),
    // modulesControlsZoomTests = require("./tests/modules/controls/Zoom.js"),
    panTests = require("./tests/Pan.js"),
    zoomTests = require("./tests/Zoom.js"),
    legendTests = require("./tests/Legend.js");

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
    describe(`MasterTests in ${browsername} (mode=${mode},resolution=${resolution},config=${config})`, function () {
        this.timeout(150000);

        const e2eTestParams = {builder, url, resolution, config, mode, browsername};

        /*
         * restriction statement to reduce tests during writing; will change a lot and should be ultimately removed;
         * overall test call structure may require some changes previously to reduce run-time
         */
        if (mode !== "2D") {
            // usage of 3D/OB mode not ready yet
            return;
        }


        // modules/controls
        // TODO commented out for dev branch until ready
        // modulesControlsAttributionsTests(e2eTestParams);
        modulesControlsBackForwardTests(e2eTestParams);

        // TODO commented out since failing (for chrome)
        // modulesControlsFreezeTests(e2eTestParams);

        // TODO commented out for dev branch until ready
        // modulesControlsFullScreenTests(e2eTestParams);
        modulesControlsOrientationTests(e2eTestParams);
        // TODO commented out for dev branch until ready
        // modulesControlsOverviewMapTests(e2eTestParams);
        modulesControlsTotalViewTests(e2eTestParams);
        // TODO commented out for dev branch until ready
        // modulesControlsZoomTests(e2eTestParams);

        // non-module tests
        panTests(e2eTestParams);
        zoomTests(e2eTestParams);
        legendTests(e2eTestParams);
    });
}

module.exports = tests;
