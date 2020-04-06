const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution, mouseWheelUp, mouseWheelDown} = require("../library/scripts"),
    {onMoveEnd} = require("../library/scriptsAsync"),
    {initDriver} = require("../library/driver"),
    {isMobile} = require("../settings"),
    {By} = webdriver;

/**
 * Tests regarding map zooming.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ZoomTests ({builder, url, resolution}) {
    const skipWheel = isMobile(resolution); // no mouse wheel on mobile devices

    (skipWheel ? describe.skip : describe)("Map Zoom with MouseWheel", function () {
        let driver, canvas;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
            canvas = await driver.findElement(By.css(".ol-viewport"));
        });

        after(async function () {
            await driver.quit();
        });

        it("should zoom in on mouse wheel up", async function () {
            const res = await driver.executeScript(getResolution);

            await driver.executeScript(mouseWheelUp, canvas);
            await driver.executeAsyncScript(onMoveEnd);

            expect(res).to.be.above(await driver.executeScript(getResolution));
        });

        it("should zoom out on mouse wheel down", async function () {
            const res = await driver.executeScript(getResolution);

            await driver.executeScript(mouseWheelDown, canvas);
            await driver.executeAsyncScript(onMoveEnd);

            expect(res).to.be.below(await driver.executeScript(getResolution));
        });
    });
}

module.exports = ZoomTests;
