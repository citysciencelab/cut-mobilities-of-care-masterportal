const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution, mouseWheelUp, mouseWheelDown} = require("../../../test/end2end/library/scripts"),
    {initDriver} = require("../../../test/end2end/library/driver"),
    {isMobile} = require("../../../test/end2end/settings"),
    {By} = webdriver;

/**
 * Tests regarding map zooming.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ZoomTests ({builder, url, resolution}) {
    const testIsApplicable = !isMobile(resolution); // no mouse wheel on mobile devices

    if (testIsApplicable) {
        describe("Map Zoom with MouseWheel", function () {
            let driver, canvas;

            before(async function () {
                driver = await initDriver(builder, url, resolution);
                canvas = await driver.findElement(By.css(".ol-viewport"));
            });

            after(async function () {
                await driver.quit();
            });

            it("should zoom in on mouse wheel up", async function () {
                this.timeout(15000);
                const res = await driver.executeScript(getResolution);

                /* only do-while on zoom-in since function may not be ready;
                 * zoom-out should then work immediately right after */
                do {
                    await driver.executeScript(mouseWheelUp, canvas);
                    await driver.wait(new Promise(r => setTimeout(r, 500)));
                } while (res <= await driver.executeScript(getResolution));
            });

            it("should zoom out on mouse wheel down", async function () {
                this.timeout(15000);
                const res = await driver.executeScript(getResolution);

                await driver.executeScript(mouseWheelDown, canvas);
                await driver.wait(new Promise(r => setTimeout(r, 500)));

                expect(res).to.be.below(await driver.executeScript(getResolution));
            });
        });
    }
}

module.exports = ZoomTests;
