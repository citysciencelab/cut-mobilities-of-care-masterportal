const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {isCustom, isMaster} = require("../../../../../../test/end2end/settings"),
    {logBrowserstackUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function AttributionsTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isCustom(url) || isMaster(url); // attributions only active in custom/master

    if (testIsApplicable) {
        describe("Modules Controls Attributions", () => {
            let driver, attributionsButton, attributionsDiv;

            before(async () => {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
            });

            after(async () => {
                if (capability) {
                    driver.session_.then(sessionData => {
                        logBrowserstackUrlToTest(sessionData.id_);
                    });
                }
                await driver.quit();
            });

            it("should have an attributions button", async () => {
                await driver.wait(until.elementLocated(By.css(".attributions-button")), 50000);
                attributionsButton = await driver.findElement(By.css(".attributions-button"));

                expect(attributionsButton).to.exist;
            });

            it("should open/close closed/opened attributions on clicking attribution button", async () => {
                await attributionsButton.click();
                expect((await driver.findElements(By.css(".attributions-div"))).length).to.equal(0);
                attributionsButton = await driver.findElement(By.css(".attributions-button"));
                await attributionsButton.click();
                attributionsDiv = await driver.findElement(By.css(".attributions-view"));
                expect(attributionsDiv).to.exist;
            });

            it("should have attributions text 'Attributierung für Fachlayer'", async () => {
                const attributionsHeader = await driver.findElement(By.xpath("//dt[contains(.,'Krankenhäuser:')]")),
                    attributionsText = await driver.findElement(By.xpath("//dd/span[contains(.,'Attributierung für Fachlayer')]"));

                expect(attributionsHeader).to.exist;
                expect(attributionsText).to.exist;
            });
        });
    }
}

module.exports = AttributionsTests;
