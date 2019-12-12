const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {isCustom, isDefault} = require("../../../settings"),
    {getCenter} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {By, until} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function Orientation ({builder, url, resolution}) {
    const skipGeoLocate = !(isCustom(url) || isDefault(url)), // fullscreen only in CT/DT
        skipPoi = true;

    (skipGeoLocate ? describe.skip : describe)("Modules Controls GeoLocate", function () {
        let driver, geolocateButton;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("has a button for geolocating", async function () {
            await driver.wait(until.elementLocated(By.id("geolocate")), 9000);
            geolocateButton = await driver.findElement(By.id("geolocate"));

            expect(geolocateButton).to.exist;
        });

        /*
         * TODO the following code blocks on the GeoLocation API. It can not be clicked here
         * since the message is above alert level, where Selenium provides not access.
         *
         * For Firefox, a profile allowing access can be configured.
         * For Chrome, this seems to simply not be possible?
         *
         * => Is this test worth it?
         * (It works if you manually click the button; this code here should be fine already.)
         */
        it.skip("relocates map after clicking the button", async function () {
            const center = await driver.executeScript(getCenter);

            await driver.actions({bridge: true})
                .click(geolocateButton)
                .perform();

            await driver.wait(until.elementIsVisible(await driver.findElement(By.id("geolocation_marker"))), 50000);

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });
    });

    // TODO poi button currently not visible in any configuration
    // TODO POI feature has the same issue as GeoLocation above
    (skipPoi ? describe.skip : describe)("Modules Controls ProximitySearch", function () {
        let driver, poiButton;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("should have a poi button", async function () {
            poiButton = await driver.findElement(By.id("geolocatePOI"));
            await driver.wait(until.elementIsVisible(poiButton), 1000, "POI Button not visible.");

            expect(poiButton).to.exist;
        });

        it("should open the POI window after click on the poi button", async function () {
            await driver.actions({bridge: true})
                .click(poiButton)
                .perform();

            // TODO test all distances and check if results change accordingly
            await driver.wait(until.elementLocated(By.id("base-modal")), 20000);
            await driver.wait(until.elementLocated(By.linkText("2000m")), 9000);

            expect(driver.findElement(By.linkText("2000m"))).to.exist;
        });

        it("should relocate after click on an item", async function () {
            const center = await driver.executeScript(getCenter),
                poiListEntry = await driver.findElement(By.css("#poiList > div > div > span"));

            await driver.actions({bridge: true})
                .click(poiListEntry)
                .perform();

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });
    });
}

module.exports = Orientation;
