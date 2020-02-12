const // modulesControlsAttributionsTests = require("./tests/modules/controls/Attributions.js"),
    modulesControlsBackForwardTests = require("./tests/modules/controls/BackForward.js"),
    modulesControlsButton3DTests = require("./tests/modules/controls/Button3D.js"),
    // modulesControlsButtonObliqueTests = require("./tests/modules/controls/ButtonOblique.js"),
    // modulesControlsFreezeTests = require("./tests/modules/controls/Freeze.js"),
    // modulesControlsFullScreenTests = require("./tests/modules/controls/FullScreen.js"),
    modulesControlsOrientationTests = require("./tests/modules/controls/Orientation.js"),
    // modulesControlsOverviewMapTests = require("./tests/modules/controls/OverviewMap.js"),
    modulesControlsTotalViewTests = require("./tests/modules/controls/TotalView.js"),
    // modulesControlsZoomTests = require("./tests/modules/controls/Zoom.js"),
    modulesCoreParametricUrlTests = require("./tests/modules/core/ParametricUrl.js"),
    modulesSearchbarSearchCategories = require("./tests/modules/searchbar/SearchCategories.js"),
    modulesSearchbarGdiSearch = require("./tests/modules/searchbar/GdiSearch.js"),
    modulesToolsCoord = require("./tests/modules/tools/Coord.js"),
    modulesToolsGfi = require("./tests/modules/tools/Gfi.js"),
    modulesToolsMeasure = require("./tests/modules/tools/Measure.js"),
    modulesToolsParcelSearch = require("./tests/modules/tools/ParcelSearch.js"),
    modulesToolsSearchByCoord = require("./tests/modules/tools/SearchByCoord.js"),
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

        // TODO remove to activate OB testing
        if (mode === "OB") {
            return;
        }

        const suites = [
                // // // modules/controls
                // modulesControlsAttributionsTests,
                modulesControlsBackForwardTests,
                modulesControlsButton3DTests,
                // TODO pull OB to different suites array - maybe depending on environment variable?
                // modulesControlsButtonObliqueTests,
                // modulesControlsFreezeTests,
                // modulesControlsFullScreenTests,
                modulesControlsOrientationTests,
                // modulesControlsOverviewMapTests,
                modulesControlsTotalViewTests,
                // modulesControlsZoomTests,

                // // // modules/core
                modulesCoreParametricUrlTests,

                // // // modules/searchbar
                modulesSearchbarSearchCategories,
                modulesSearchbarGdiSearch,

                // // // modules/tools
                modulesToolsCoord,
                modulesToolsGfi,
                modulesToolsMeasure,
                modulesToolsParcelSearch,
                modulesToolsSearchByCoord,

                // // // non-module tests
                legendTests,
                panTests,
                zoomTests
            ],
            e2eTestParams = {builder, url, resolution, config, mode, browsername};

        for (const suite of suites) {
            suite(e2eTestParams);
        }
    });
}

module.exports = tests;
