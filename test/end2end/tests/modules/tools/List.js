const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isMaster, isMobile} = require("../../../settings"),
    // {getCenter, getResolution} = require("../../../library/scripts"),
    {logBrowserstackUrlToTest} = require("../../../library/utils"),
    {By, until} = webdriver;

/**
 * Tests regarding list tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ListTests ({builder, url, resolution, capability}) {
    if (isMaster(url) && !isMobile(resolution)) {
        describe("List", function () {
            let driver, hospitalLayerEntry, featureListEntries;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
            });

            after(async function () {
                if (capability) {
                    driver.session_.then(function (sessionData) {
                        logBrowserstackUrlToTest(sessionData.id_);
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

            it("tool opens with 3 tabs, initially listing active vector layers", async function () {
                await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
                await (await driver.findElement(By.css("#tools .glyphicon-menu-hamburger"))).click();

                await driver.wait(until.elementIsVisible(
                    await driver.findElement(By.css("div#window li#featurelistThemeChooser.active")),
                    5000,
                    "theme chooser was not initially active or did not become visible"
                ));
                await driver.findElement(By.css("div#window li#featurelistFeaturelist"));
                await driver.findElement(By.css("div#window li#featurelistFeaturedetails"));

                hospitalLayerEntry = await driver.findElement(By.css("#featurelist-layer-1711"));
            });

            it("tool lists visible features", async function () {
                await driver.wait(
                    until.elementIsVisible(hospitalLayerEntry),
                    5000,
                    "hospital layer entry did not become visible"
                );
                await hospitalLayerEntry.click();
                await driver.wait(
                    until.elementLocated(By.css("#featurelistFeaturelist.active")),
                    5000,
                    "feature list was not activated"
                );
                await driver.findElement(By.css("#featurelist-list-table"));

                featureListEntries = await driver.findElements(By.css("#featurelist-list-table tbody tr"));

                expect(featureListEntries).to.have.lengthOf(10);
            });

            it("visible features list can be expanded", async function () {
                await (await driver.findElement(By.css(".panel-footer .featurelist-list-button"))).click();
                featureListEntries = await driver.findElements(By.css("#featurelist-list-table tbody tr"));

                expect(featureListEntries).to.have.lengthOf(20);
            });

            it("hovering a feature changes the feature style", async function () {
                await driver
                    .actions({bridge: true})
                    .move({origin: featureListEntries[14]})
                    .perform();

                /**
                 * While this is a script, it is very specific and probably has no reusability, hence placed here.
                 * @returns {number} returns scale of the visually enlarged feature
                 */
                function retrieveScale () {
                    return Backbone
                        .Radio
                        .request("Map", "getMap")
                        .getLayers()
                        .getArray()
                        .find(l => l.get("id") === "1711") // get hospital layer
                        .getSource()
                        .getFeatures()
                        .map(f => f.getStyle())
                        .find(x => x) // only changed style is not "null" - sort falsy out
                        .getImage()
                        .getScale();
                }

                const enlargedScale = await driver.executeScript(retrieveScale);

                // confirm a feature has an enhances display scale
                expect(enlargedScale).to.be.greaterThan(1);
            });

            // it("clicking a feature zooms and centers on it", async function () {
            //     /* clicking featureListEntries[0] - chromedriver can, geckodriver can't manage to
            //      * vertically scroll the tr center into view; workaround: click first cell of first row */
            //     await (await driver.findElement(By.css("#featurelist-list-table tbody tr td"))).click();
            //     await driver.wait(
            //         until.elementLocated(By.css("#featurelistFeaturedetails.active")),
            //         5000,
            //         "details tab was not activated"
            //     );

            //     expect(await driver.executeScript(getCenter)).to.deep.equal([569773.549, 5937127.029]);
            //     expect(await driver.executeScript(getResolution)).to.equal(0.13229159522920522);
            // });
        });
    }
}

module.exports = ListTests;
