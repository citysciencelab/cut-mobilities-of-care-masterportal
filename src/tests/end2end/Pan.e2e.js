const webdriver = require("selenium-webdriver"),
    {getCenter} = require("../../../test/end2end/library/scripts"),
    {losesCenter, logTestingCloudUrlToTest} = require("../../../test/end2end/library/utils"),
    {initDriver} = require("../../../test/end2end/library/driver"),
    {isChrome} = require("../../../test/end2end/settings"),
    {By, Button} = webdriver;

/**
 * Tests regarding map panning.
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {String} params.browsername the name of the broser (to use chrome put "chrome" into the name)
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
async function PanTests ({builder, url, resolution, browsername, capability}) {
    // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
    (isChrome(browsername) ? describe.skip : describe)("Map Pan", function () {
        let driver;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                capability["sauce:options"].name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            if (capability) {
                driver.session_.then(function (sessionData) {
                    logTestingCloudUrlToTest(sessionData.id_);
                });
            }
            await driver.quit();
        });

        afterEach(async function () {
            if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
                console.warn("      FAILED! Retrying test \"" + this.currentTest.title + "\"  after reloading url");
                await driver.quit();
                driver = await initDriver(builder, url, resolution);
            }
        });

        it("should move when panned", async function () {
            this.timeout(10000);
            const center = await driver.executeScript(getCenter),
                viewport = await driver.findElement(By.css(".ol-viewport"));

            // since there's no clear sign when panning is active, retry for the timeout written above
            do {
                await driver.actions({bridge: true})
                    .move({origin: viewport})
                    .press(Button.LEFT)
                    .move({origin: viewport, x: 10, y: 10})
                    .release(Button.LEFT)
                    .perform();
            } while (!await losesCenter(driver, center));
        });
    });
}

module.exports = PanTests;
