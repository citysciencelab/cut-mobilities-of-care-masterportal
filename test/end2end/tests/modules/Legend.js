const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../library/driver"),
    {getTextOfElements, logTestingCloudUrlToTest} = require("../../library/utils"),
    {isMaster, isCustom} = require("../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function LegendTests ({builder, config, url, resolution, capability}) {
    const testIsApplicable = isMaster(url) || isCustom(url),
        expectedEntries = {
            master: ["Krankenhäuser", "Schulinfosystem"],
            custom: ["Krankenhäuser und Schulen", "Geobasiskarten (farbig)"]
        }[config];

    if (testIsApplicable) {
        describe("Legend", function () {
            let driver;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    capability["sauce:options"].name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
            });

            after(async function () {
                if (capability) {
                    driver.session_.then(function (sessionData) {
                        logTestingCloudUrlToTest(sessionData.id_);
                    });
                }
                await driver.quit();
            });

            afterEach(async function () {
                if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
                    console.warn("      FAILED! Retrying test \"" + this.currentTest.title + "\"  after reloading url");
                    await driver.quit();
                    driver = await initDriver(builder, url, resolution);
                }
            });

            it("should contain active layers", async function () {
                // retry until functionality is active - may get stuck else
                do {
                    await (await driver.wait(
                        until.elementLocated(By.id("legend-menu")), 2000)
                    ).click();
                    await driver.wait(new Promise(r => setTimeout(r, 50)));
                } while (
                    // .legend-win only available from the start in master, must check for availability in custom
                    (await driver.findElements(By.id("legend"))).length === 0 ||
                    // additional check for master: since element is available from the start, wait until visible
                    !await (await driver.findElements(By.id("legend")))[0].isDisplayed()
                );

                const legendContent = await driver.wait(until.elementLocated(By.css("div.legend-content")), 2000),
                    headers = await legendContent.findElements(By.css("div.layer-title")),
                    text = await getTextOfElements(headers);

                for (const entry of expectedEntries) {
                    expect(text).to.include(entry);
                }
            });
        });
    }
}

module.exports = LegendTests;
