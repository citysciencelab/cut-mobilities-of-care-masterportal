const {isBasic, is2D} = require("./settings");

/**
 * Description of the parameter set forwarded to each test suite. Each test suite may decide in itself
 * which parameters are required and must build the driver by itself, either per test or for the whole suite.
 * @typedef {Object} e2eTestParams
 * @property {selenium-webdriver.Builder} builder fully prepared builder that can be used for instantiation
 * @property {String} url to open Masterportal with
 * @property {String} resolution as WIDTHxHEIGHT
 * @property {String} config key that defines which config the Masterportal should run on
 * @property {String} mode key that defines which steps should be taken before testing (e.g. activating 3D)
 * @property {String} browsername string indicating which browser is in use
 * @property {Object} capability containes browserstack capability
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
 * @param {Object} capability containes browserstack capability
 * @param {Boolean} deploymentTest if true, only one test for a deployed portal is running
 * @returns {void}
 */
function tests (builder, url, browsername, resolution, config, mode, capability, deploymentTest) {
    describe(`${browsername} (mode=${mode},resolution=${resolution},config=${config})`, function () {
        this.timeout(3600000);

        if (isBasic(url) && !is2D(mode)) {
            // portal/basic does not offer any mode besides 2D; skip all suites for non-2D basic
            return;
        }

        // TODO remove to activate OB/3D testing (not used in first iteration, and OB may be moved to a different test run)
        if (mode === "OB" || mode === "3D") {
            return;
        }

        /*
        * TODO Check/Fix/Implement and re-activate tests one by one. Each running
        * test shall then be PR'd back to dev to avoid tests and dev diverging again.
        */
        const suites = [
                // modules/controls
                require("../../src/modules/controls/attributions/tests/end2end/Attributions.e2e.js"),
                require("../../src/modules/controls/backForward/tests/end2end/BackForward.e2e.js"),
                // require("./tests/modules/controls/Button3D.js"),
                // TODO pull OB to different suites array - maybe depending on environment variable? up for discussion
                require("./tests/modules/controls/ButtonOblique.js"),
                require("../../src/modules/controls/freeze/tests/end2end/Freeze.e2e.js"),
                require("../../src/modules/controls/fullScreen/tests/end2end/FullScreen.e2e.js"),
                require("./tests/modules/controls/Orientation.js"),
                require("../../src/modules/controls/overviewMap/tests/end2end/OverviewMap.e2e.js"),
                require("../../src/modules/controls/totalView/tests/end2end/TotalView.e2e.js"),
                require("../../src/modules/controls/zoom/test/end2end/Zoom.e2e.js"),

                // modules/core
                // require("./tests/modules/core/ParametricUrl.js"),

                // modules/menu
                // require("./tests/modules/menu/Layers.js"),

                // modules/searchbar
                // require("./tests/modules/searchbar/SearchCategories.js"),
                // require("./tests/modules/searchbar/GdiSearch.js"),

                // modules/tools
                require("../../src/modules/tools/contact/tests/end2end/Contact.e2e.js"),
                // require("./tests/modules/tools/PopulationRequest_HH.js"),
                // require("../../src/modules/tools/supplyCoord/test/end2end/SupplyCoord.e2e.js"),
                require("./tests/modules/tools/ExtendedFilter.js"),
                require("../../src/modules/tools/gfi/tests/end2end/Gfi.e2e.js"),
                // require("./tests/modules/tools/Gfi.js"),old GFI-Test do not delete!
                require("./tests/modules/Legend.js"),
                require("./tests/modules/tools/List.js"),
                require("../../src/modules/tools/measure/tests/end2end/Measure.e2e.js"),
                // require("./tests/modules/tools/ParcelSearch.js"),
                // require("./tests/modules/tools/SearchByCoord.js"),

                // non-module tests
                require("../../src/tests/end2end/Pan.e2e.js"),
                require("../../src/tests/end2end/Zoom.e2e.js")
            ],
            deplomentTestSuites = [
                require("../../src/tests/end2end/DeployedPortals.e2e.js")
            ],
            e2eTestParams = {builder, url, resolution, config, mode, browsername, capability};
        let suitesToRun = suites;

        if (deploymentTest !== false) {
            suitesToRun = deplomentTestSuites;
        }

        for (const suite of suitesToRun) {
            this.retries(2);
            suite(e2eTestParams);
        }
    });
}

module.exports = tests;
