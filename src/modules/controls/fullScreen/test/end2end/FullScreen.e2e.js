const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {isFullscreen} = require("../../../../../../test/end2end/library/scripts"),
    {isMobile, isMaster, isCustom, isDefault} = require("../../../../../../test/end2end/settings"),
    {logBrowserstackUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {writeScreenshot} = require("../../../../../../test/end2end/library/screenshot"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function FullScreenTest ({builder, url, resolution, capability}) {
    const testIsApplicable = !isMobile(resolution) &&
        (isMaster(url) || isCustom(url) || isDefault(url));

    if (testIsApplicable) {
        describe("Modules Controls FullScreen", () => {
            const fullScreenButtonSelector = By.css(".fullscreen-button .control-icon"),
                removeIconSelector = By.css(".fullscreen-button .control-icon.glyphicon-resize-small"),
                fullscreenIconSelector = By.css(".fullscreen-button .control-icon.glyphicon-fullscreen");
            let driver;

            before(async () => {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
            });

            after(async () => {
                if (capability) {
                    driver.session_.then(sessionData => {
                        logBrowserstackUrlToTest(sessionData.id_);
                    });
                }
                await driver.quit();
            });

            it("should have a fullscreen button", async () => {
                await driver.wait(until.elementLocated(fullScreenButtonSelector), 9000);
                expect(await driver.findElement(fullScreenButtonSelector)).to.exist;
            });

            it("should switch to fullscreen after click fullscreenbutton", async () => {
                await driver.actions({bridge: true})
                    .click(await driver.findElement(fullScreenButtonSelector))
                    .perform();
                await driver.wait(until.elementLocated(removeIconSelector), 9000);
                await writeScreenshot(driver, "Fullscreen.png");
                await driver.wait(async () => driver.executeScript(isFullscreen), 5000, "Fullscreen was not activated.");
            });

            it("should switch back to normal screen after clicking the fullscreen button again", async () => {
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
