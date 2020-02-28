const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../library/driver"),
    {getTextOfElements} = require("../library/utils"),
    {isMaster, isCustom} = require("../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function LegendTests ({builder, config, url, resolution}) {
    const testIsApplicable = isMaster(url) || isCustom(url),
        expectedEntries = {
            master: ["Krankenhäuser", "Schulinfosystem", "Hauptkirchen"],
            custom: ["Krankenhäuser und Schulen", "Geobasiskarten (farbig)"]
        }[config];

    if (testIsApplicable) {
        describe("Legend", function () {
            let driver;

            before(async function () {
                driver = await initDriver(builder, url, resolution);
            });

            after(async function () {
                await driver.quit();
            });

            it("should contain active layers", async function () {
                await (await driver.wait(until.elementLocated(By.xpath("//div[@id='navbarRow']//a[contains(normalize-space(),'Legende')]")))).click();

                const legendContent = await driver.wait(until.elementLocated(By.css(".legend-win-content"))),
                    headers = await legendContent.findElements(By.tagName("h4")),
                    text = await getTextOfElements(headers);

                for (const entry of expectedEntries) {
                    expect(text).to.include(entry);
                }
            });
        });
    }
}

module.exports = LegendTests;
