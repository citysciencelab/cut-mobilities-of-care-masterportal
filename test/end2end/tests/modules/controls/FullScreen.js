const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isFullscreen} = require("../../../library/scripts"),
    {isMobile, isMaster, isCustom, isDefault} = require("../../../settings"),
    {writeScreenshot} = require("../../../library/screenshot"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function FullScreenTest ({builder, url, resolution}) {
    const testIsApplicable = !isMobile(resolution) &&
        (isMaster(url) || isCustom(url) || isDefault(url));

    if (testIsApplicable) {
        describe("Modules Controls FullScreen", function () {
            const fullScreenButtonSelector = By.xpath("//div[@id='fullScreen']/div/span"),
                removeIconSelector = By.xpath("//div[@id='fullScreen']/div/span[@class='glyphicon glyphicon-remove']"),
                fullscreenIconSelector = By.xpath("//div[@id='fullScreen']/div/span[@class='glyphicon glyphicon-fullscreen']");
            let driver;

            before(async function () {
                driver = await initDriver(builder, url, resolution);
            });

            after(async function () {
                await driver.quit();
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
