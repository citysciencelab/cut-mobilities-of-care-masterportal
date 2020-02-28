const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getCenter} = require("../library/scripts"),
    {onMoveEnd} = require("../library/scriptsAsync"),
    {initDriver} = require("../library/driver"),
    {isChrome} = require("../settings"),
    {By, Button} = webdriver;

/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function PanTests ({builder, url, resolution, browsername}) {
    // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
    (isChrome(browsername) ? describe.skip : describe)("Map Pan", function () {
        let driver;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        // TODO randomly doesn't skip - retry until it works? Listen to OL until it's ready to pan somehow?
        it.skip("should move when panned", async function () {
            const center = await driver.executeScript(getCenter),
                viewport = await driver.findElement(By.css(".ol-viewport"));

            await driver.actions({bridge: true})
                .move({origin: viewport})
                .press(Button.LEFT)
                .move({origin: viewport, x: 10, y: 10})
                .release(Button.LEFT)
                .perform();

            await driver.executeAsyncScript(onMoveEnd);

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });
    });
}

module.exports = PanTests;
