const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../library/driver"),
    {getTextOfElements} = require("../library/utils"),
    {By, until} = webdriver;


/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function LegendTests ({builder, config, url, resolution}) {

    describe("Legend", function () {
        let driver;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("should contain active layers", async function () {
            const legendButton = await driver.wait(until.elementLocated(By.xpath("//div[contains(@id, 'navbarRow')]//a[contains(normalize-space(),'Legende')]")));

            await driver.actions({bridge: true})
                .move({origin: legendButton})
                .click()
                .perform();

            /* eslint-disable-next-line one-var */
            const legendContent = await driver.wait(until.elementLocated(By.css(".legend-win-content")));

            if (config === "CT") {
                const headers = await legendContent.findElements(By.tagName("h4"));

                expect(await getTextOfElements(headers)).to.eql(["Krankenhäuser und Schulen", "Geobasiskarten (farbig)", "Oblique"]);
            }
            else {
                expect(await legendContent.getText()).to.equal("");
            }
        });
    });
}

module.exports = LegendTests;
