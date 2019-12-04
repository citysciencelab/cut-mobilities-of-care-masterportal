const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isFullscreen} = require("../../../library/scripts"),
    {isMobile, isBasic} = require("../../../settings"),
    {writeScreenshot} = require("../../../library/screenshot"),
    {until, By} = webdriver;

/**
 * Tests regarding full screen control element.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function FullScreenTest ({builder, url, resolution}) {
    const skipAll = isMobile(resolution) || isBasic(url);
    // TODO test in 23, OB, too

    (skipAll ? describe.skip : describe)("Modules Controls Fullscreen", function () {
        let driver, fullscreenElement;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("should have a fullscreen button", async function () {
            await driver.wait(until.elementLocated(By.xpath("//div[@id='fullScreen']/div/span")), 9000);
            fullscreenElement = await driver.findElement(By.xpath("//div[@id='fullScreen']/div/span"));

            expect(fullscreenElement).to.exist;
        });

        it("should switch to fullscreen after click fullscreenbutton", async function () {
            await driver.actions({bridge: true})
                .click(fullscreenElement)
                .perform();
            await driver.wait(until.elementLocated(By.xpath("//div[@id='fullScreen']/div/span[@class='glyphicon glyphicon-remove']")), 9000);
            await writeScreenshot(driver, "Fullscreen.png");
            const fullscreen = await driver.executeScript(isFullscreen);

            expect(fullscreen).to.be.true;

        });

        it("should switch back to normal screen after clicking the fullscreen button again", async function () {
            await driver.actions({bridge: true})
                .click(fullscreenElement)
                .perform();
            await driver.wait(until.elementLocated(By.xpath("//div[@id='fullScreen']/div/span[@class='glyphicon glyphicon-fullscreen']")), 9000);
            await writeScreenshot(driver, "FullscreenBack.png");
            const fullscreen = await driver.executeScript(isFullscreen);

            expect(fullscreen).to.be.false;
        });
    });
}

module.exports = FullScreenTest;
