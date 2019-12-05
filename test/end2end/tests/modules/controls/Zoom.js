const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {isMobile} = require("../../../settings"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function ZoomTests ({builder, url, resolution}) {
    const skipAll = isMobile(resolution); // no zoom buttons on mobile devices

    (skipAll ? describe.skip : describe)("Modules Controls Zoom", function () {
        let driver, minus, plus;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("should have a plus button", async function () {
            await driver.wait(until.elementLocated(By.css("span.glyphicon.glyphicon-plus")), 50000);
            plus = await driver.findElement(By.xpath("//div[@class='zoomButtons']/span[@class='glyphicon glyphicon-plus']"));

            expect(plus).to.exist;
        });

        it("should zoom in after clicking plus button", async function () {
            const res = await driver.executeScript(getResolution);

            await plus.click();

            expect(res).to.be.above(await driver.executeScript(getResolution));
        });

        it("should have a minus button", async function () {
            minus = await driver.findElement(By.xpath("//div[@class='zoomButtons']/span[@class='glyphicon glyphicon-minus']"));

            expect(minus).to.exist;
        });

        it("should zoom out after clicking minus button", async function () {
            const res = await driver.executeScript(getResolution);

            await minus.click();

            expect(res).to.be.below(await driver.executeScript(getResolution));
        });
    });
}

module.exports = ZoomTests;
