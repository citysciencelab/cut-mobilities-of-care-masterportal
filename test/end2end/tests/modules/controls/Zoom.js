const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {isMobile, isChrome, isCustom} = require("../../../settings"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function ZoomTests ({builder, url, browsername, resolution}) {
    const testIsApplicable = !isMobile(resolution); // no zoom buttons on mobile devices

    if (testIsApplicable) {
        describe("Modules Controls Zoom", function () {
            let driver, minus, plus;

            before(async function () {
                driver = await initDriver(builder, url, resolution);
            });

            after(async function () {
                await driver.quit();
            });

            it("should have a plus button", async function () {
                await driver.wait(until.elementLocated(By.css(".zoomButtons span.glyphicon.glyphicon-plus")), 50000);
                plus = await driver.findElement(By.css(".zoomButtons span.glyphicon.glyphicon-plus"));

                expect(plus).to.exist;
            });

            it("should zoom in after clicking plus button", async function () {
                const res = await driver.executeScript(getResolution);

                await plus.click();
                await driver.wait(async () => res > await driver.executeScript(getResolution), 3000, "Map did not zoom in.");
            });

            it("should have a minus button", async function () {
                minus = await driver.findElement(By.css(".zoomButtons span.glyphicon.glyphicon-minus"));

                expect(minus).to.exist;
            });

            // TODO CSS in chromeXcustom has attributions above minus button - skip for now
            (isChrome(browsername) && isCustom(url) ? it.skip : it)("should zoom out after clicking minus button", async function () {
                const res = await driver.executeScript(getResolution);

                await minus.click();
                await driver.wait(async () => res < await driver.executeScript(getResolution), 3000, "Map did not zoom out.");
            });
        });
    }
}

module.exports = ZoomTests;
