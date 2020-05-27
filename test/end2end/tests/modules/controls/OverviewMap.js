const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {isCustom, isMaster, isMobile, isChrome} = require("../../../settings"),
    {losesCenter} = require("../../../library/utils"),
    {getCenter} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {until, By, Button} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function OverviewMap ({builder, url, resolution, browsername}) {
    const testIsApplicable = !isMobile(resolution) && (isCustom(url) || isMaster(url));

    if (testIsApplicable) {
        describe("Modules Controls OverviewMap", function () {
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

                // open - is closed initially in master
                if (isMaster(url)) {
                    await click.perform();
                }

                // close - is open initially in custom
                await click.perform();
                expect((await driver.findElements(By.css(".ol-overviewmap.ol-custom-overviewmap"))).length).to.equal(0);

                // open
                await click.perform();
                customOverviewMap = await driver.findElement(By.css(".ol-overviewmap.ol-custom-overviewmap"));
                overviewMapViewport = await driver.findElement(By.css(".ol-overviewmap.ol-custom-overviewmap .ol-viewport"));

                expect(customOverviewMap).to.exist;
                expect(overviewMapViewport).to.exist;
            });

            // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
            (isChrome(browsername) ? it.skip : it)("allows panning the map from the overview map", async function () {
                const center = await driver.executeScript(getCenter);

                await driver.actions({bridge: true})
                    .move({origin: overviewMapViewport})
                    .press(Button.LEFT)
                    .move({origin: overviewMapViewport, x: 5, y: 5})
                    .release(Button.LEFT)
                    .perform();

                await losesCenter(driver, center);
            });
        });
    }
}

module.exports = OverviewMap;
