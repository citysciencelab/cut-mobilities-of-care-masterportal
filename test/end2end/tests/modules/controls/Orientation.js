const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {isBasic} = require("../../../settings"),
    {getCenter, mockGeoLocationAPI} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {By, until} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function Orientation ({builder, url, resolution}) {
    const skipProximity = !isBasic(url); // only configured in basic

    // TODO button currently missing; may work again after rebasing
    describe.skip("Modules Controls GeoLocate", function () {
        let driver, geolocateButton;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
            await driver.executeScript(mockGeoLocationAPI);
        });

        after(async function () {
            await driver.quit();
        });

        it("has a button for geolocating", async function () {
            await driver.wait(until.elementLocated(By.id("geolocate")), 9000);
            geolocateButton = await driver.findElement(By.id("geolocate"));

            expect(geolocateButton).to.exist;
        });

        it("relocates map after clicking the button", async function () {
            const center = await driver.executeScript(getCenter);

            await driver.wait(new Promise(r => setTimeout(r, 2500)));
            await geolocateButton.click();

            await driver.wait(until.elementLocated(By.id("geolocation_marker")));
            await driver.wait(until.elementIsVisible(await driver.findElement(By.id("geolocation_marker"))));

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });
    });

    // TODO button currently missing; may work again after rebasing
    (skipProximity ? describe.skip : describe.skip)("Modules Controls ProximitySearch", function () {
        let driver, poiButton;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
            await driver.executeScript(mockGeoLocationAPI);
            await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
            await (await driver.findElement(By.xpath("//ul[@id='tree']/li[7]/span/span/span"))).click();
            await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
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

            await driver.wait(until.elementLocated(By.css("div.modal-dialog")));
            await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'500m')]")));
            await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'1000m')]")));
            await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'2000m')]")));
        });

        it("should relocate after click on an item", async function () {
            await (await driver.findElement(By.xpath("//ul[contains(@class,'nav')]/li/a[contains(.,'2000m')]"))).click();

            const center = await driver.executeScript(getCenter);

            await (await driver.findElement(By.css("div.modal-dialog table.table td"))).click();

            expect(center).not.to.eql(await driver.executeScript(getCenter));
        });
    });
}

module.exports = Orientation;
