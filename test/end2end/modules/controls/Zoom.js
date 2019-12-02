const expect = require("chai").expect,
    webdriver = require("selenium-webdriver"),
    {getResolution, mouseWheelCanvasUp, mouseWheelCanvasDown} = require("../../library/scripts"),
    {onMoveEnd} = require("../../library/scriptsAsync"),
    {initDriver} = require("../../library/driver"),
    {isMobile} = require("../../settings"),
    {until, By} = webdriver;

/**
 * Tests regarding zoom function.
 * @param {selenium-webdriver.Builder} builder fully prepared builder that can be used for instantiation
 * @param {String} url to open Masterportal with
 * @param {String} resolution in format AxB with A, B being integers
 * @param {String} config key that defines which config the Masterportal should run on
 * @param {String} mode key that defines which steps should be taken before testing (e.g. activating 3D)
 * @returns {void}
 */
async function ZoomTests (builder, url, resolution, config, mode) {
    const skipAll = isMobile(resolution, config, mode);
    let driver;

    before(async function () {
        driver = await initDriver(builder, url, resolution);
    });

    after(async function () {
        await driver.quit();
    });

    (skipAll ? describe.skip : describe)("ZoomFunctions", function () {
        let minus, plus;

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
