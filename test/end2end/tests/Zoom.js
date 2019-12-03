const {expect} = require("chai"),
    {getResolution, mouseWheelCanvasUp, mouseWheelCanvasDown} = require("../library/scripts"),
    {onMoveEnd} = require("../library/scriptsAsync"),
    {initDriver} = require("../library/driver"),
    {isMobile} = require("../settings");

/**
 * Tests regarding map zooming.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ZoomTests ({builder, url, resolution}) {
    const skipAll = isMobile(resolution);

    (skipAll ? describe.skip : describe)("Map Zoom", function () {
        let driver;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("should zoom in on mouse wheel up", async function () {
            const res = await driver.executeScript(getResolution);

            await driver.executeScript(mouseWheelCanvasUp);
            await driver.executeAsyncScript(onMoveEnd);

            expect(res).to.be.above(await driver.executeScript(getResolution));
        });

        it("should zoom out on mouse wheel down", async function () {
            const res = await driver.executeScript(getResolution);

            await driver.executeScript(mouseWheelCanvasDown);
            await driver.executeAsyncScript(onMoveEnd);

            expect(res).to.be.below(await driver.executeScript(getResolution));
        });
    });
}

module.exports = ZoomTests;
