const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {isCustom, isMobile} = require("../../../settings"),
    {getCenter, getResolution, mouseWheelUp, mouseWheelDown} = require("../../../library/scripts"),
    {onMoveEnd} = require("../../../library/scriptsAsync"),
    {initDriver} = require("../../../library/driver"),
    {until, By, Button} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function OverviewMap ({builder, url, resolution, browsername}) {
    // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
    const skipCanvasPan = browsername.toLowerCase().includes("chrome"),
        skipMouseWheel = isMobile(resolution), // no mouse wheel on mobile devices
        skipAll = isMobile(resolution) || !isCustom(url); // overview map button only configured in CT

    (skipAll ? describe.skip : describe)("Modules Controls OverviewMap", function () {
        let driver, overviewMapButton, customOverviewMap, overviewMapViewport;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("has an overview map button", async function () {
            await driver.wait(until.elementLocated(By.css(".overviewmap-button")), 9000);
            overviewMapButton = await driver.findElement(By.css(".overviewmap-button"));

            expect(overviewMapButton).to.exist;
        });

        it("closes/opens overview map on clicking overview map button", async function () {
            const click = driver.actions({bridge: true}).click(overviewMapButton);

            // close - is open initially
            await click.perform();
            expect((await driver.findElements(By.css(".ol-overviewmap.ol-custom-overviewmap"))).length).to.equal(0);

            // open
            await click.perform();
            customOverviewMap = await driver.findElement(By.css(".ol-overviewmap.ol-custom-overviewmap"));

            expect(customOverviewMap).to.exist;
        });

        (skipCanvasPan ? it.skip : it)("allows panning the map from the overview map", async function () {
            const center = await driver.executeScript(getCenter);

            overviewMapViewport = await driver.findElement(By.css(".ol-overviewmap.ol-custom-overviewmap .ol-viewport"));

            await driver.actions({bridge: true})
                .move({origin: overviewMapViewport})
                .press(Button.LEFT)
                .move({origin: overviewMapViewport, x: 5, y: 5})
                .release(Button.LEFT)
                .perform();

            await driver.executeAsyncScript(onMoveEnd);

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });

        (skipMouseWheel ? it.skip : it)("should zoom full map in on mouse wheel up on overview", async function () {
            const res = await driver.executeScript(getResolution);

            await driver.executeScript(mouseWheelUp, overviewMapViewport);
            await driver.executeAsyncScript(onMoveEnd);

            expect(res).to.be.above(await driver.executeScript(getResolution));
        });

        (skipMouseWheel ? it.skip : it)("should zoom full map out on mouse wheel down on overview", async function () {
            const res = await driver.executeScript(getResolution);

            await driver.executeScript(mouseWheelDown, overviewMapViewport);
            await driver.executeAsyncScript(onMoveEnd);

            expect(res).to.be.below(await driver.executeScript(getResolution));
        });
    });
}

module.exports = OverviewMap;
