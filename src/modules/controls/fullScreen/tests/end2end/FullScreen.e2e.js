const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {isFullscreen} = require("../../../../../../test/end2end/library/scripts"),
    {isMobile, isMaster, isCustom, isDefault} = require("../../../../../../test/end2end/settings"),
    {logBrowserstackUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {writeScreenshot} = require("../../../../../../test/end2end/library/screenshot"),
    {until, By} = webdriver;

/**
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
function FullScreenTest ({builder, url, resolution, capability}) {
    const testIsApplicable = !isMobile(resolution) &&
        (isMaster(url) || isCustom(url) || isDefault(url));

    if (testIsApplicable) {
        describe("Modules Controls FullScreen", function () {
            const fullScreenButtonSelector = By.css(".fullscreen-button .control-icon"),
                removeIconSelector = By.css(".fullscreen-button .control-icon.glyphicon-resize-small"),
                fullscreenIconSelector = By.css(".fullscreen-button .control-icon.glyphicon-fullscreen");
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
                        logBrowserstackUrlToTest(sessionData.id_);
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


            it("should have a fullscreen button", async function () {
                await driver.wait(until.elementLocated(fullScreenButtonSelector), 9000);
                expect(await driver.findElement(fullScreenButtonSelector)).to.exist;
            });

            it("should switch to fullscreen after click fullscreenbutton", async function () {
                await driver.actions({bridge: true})
                    .click(await driver.findElement(fullScreenButtonSelector))
                    .perform();
                await driver.wait(until.elementLocated(removeIconSelector), 9000);
                await writeScreenshot(driver, "Fullscreen.png");
                await driver.wait(async () => driver.executeScript(isFullscreen), 5000, "Fullscreen was not activated.");
            });

            it("should switch back to normal screen after clicking the fullscreen button again", async function () {
                await driver.actions({bridge: true})
                    .click(await driver.findElement(fullScreenButtonSelector))
                    .perform();
                await driver.wait(until.elementLocated(fullscreenIconSelector), 9000);
                await writeScreenshot(driver, "FullscreenBack.png");
                await driver.wait(async () => !await driver.executeScript(isFullscreen), 5000, "Fullscreen was not deactivated.");
            });
        });
    }
}

module.exports = FullScreenTest;
