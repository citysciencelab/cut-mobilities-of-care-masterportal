const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution} = require("../../../../../../test/end2end/library/scripts"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {isMobile} = require("../../../../../../test/end2end/settings"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function ZoomTests ({builder, url, resolution}) {
    // no zoom control on mobile devices - skip
    const testIsApplicable = !isMobile(resolution);

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
                plus = await driver.wait(until.elementLocated(By.css("button.control-icon.glyphicon-plus")), 5000);
                expect(plus).to.exist;
            });

            it("should zoom in after clicking plus button", async function () {
                const res = await driver.executeScript(getResolution);

                await plus.click();
                await driver.wait(async () => res > await driver.executeScript(getResolution), 3000, "Map did not zoom in.");
            });

            it("should have a minus button", async function () {
                minus = await driver.findElement(By.css("button.control-icon.glyphicon-minus"));
                expect(minus).to.exist;
            });

            it("should zoom out after clicking minus button", async function () {
                const res = await driver.executeScript(getResolution);

                await minus.click();
                await driver.wait(async () => res < await driver.executeScript(getResolution), 3000, "Map did not zoom out.");
            });
        });
    }
}

module.exports = ZoomTests;
