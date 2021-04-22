const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {isMaster} = require("../../../settings"),
    {logBrowserstackUrlToTest} = require("../../../library/utils"),
    {getCenter, mockGeoLocationAPI} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {By, until} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function Orientation ({builder, url, resolution, capability}) {
    describe("Modules Controls GeoLocate", function () {
        let driver, geolocateButton;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await initDriver(builder, url, resolution);
            await driver.executeScript(mockGeoLocationAPI);
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
                await driver.executeScript(mockGeoLocationAPI);
            }
        });

        it("has a button for geolocating", async function () {
            geolocateButton = await driver.wait(until.elementLocated(By.id("geolocate")), 9000);
            expect(geolocateButton).to.exist;
        });

        it("relocates map after clicking the button", async function () {
            const center = await driver.executeScript(getCenter);

            await driver.wait(new Promise(r => setTimeout(r, 2500)));
            await geolocateButton.click();

            await driver.wait(until.elementIsVisible(
                await driver.wait(until.elementLocated(By.id("geolocation_marker")), 5000)
            ));

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });
    });

    // only configured in portal/master
    if (isMaster(url)) {
        describe.skip("Modules Controls ProximitySearch", function () {
            let driver, poiButton;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
                await driver.executeScript(mockGeoLocationAPI);

                const bikeAndRideSelector = By.xpath("//ul[@id='tree']/li[.//span[contains(.,'Bike and Ride')]]"),
                    themenSelector = By.css("#root .dropdown:first-child"),
                    topicButton = await driver.wait(until.elementLocated(themenSelector, 5000, "Topic Button not found."), 5000);

                await topicButton.click();
                await (await driver.wait(until.elementLocated(bikeAndRideSelector, 5000, "Layerlist entry 'Bike and Ride' not found."))).click();
                await topicButton.click();
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

            it("should have a poi button", async function () {
                poiButton = await driver.findElement(By.id("geolocatePOI"));
                await driver.wait(until.elementIsVisible(poiButton), 1000, "POI Button not visible.");

                expect(poiButton).to.exist;
            });

            it("should open the POI window after click on the poi button", async function () {
                await poiButton.click();

                await driver.wait(until.elementLocated(By.css("div.modal-dialog")), 5000);
                await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'500m')]")), 5000);
                await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'1000m')]")), 5000);
                await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'2000m')]")), 5000);
            });

            it("should relocate after click on an item", async function () {
                await (await driver.findElement(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'2000m')]"))).click();

                // NOTE: must be clicking td since clicking tr is bugged in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1448825
                const center = await driver.executeScript(getCenter),
                    firstResult = await driver.findElement(By.css("div.modal-dialog div.active table.table tr:first-child td"));

                await driver.wait(until.elementIsVisible(firstResult), 8000);
                await firstResult.click();

                expect(center).not.to.eql(await driver.executeScript(getCenter));
            });
        });
    }
}

module.exports = Orientation;
