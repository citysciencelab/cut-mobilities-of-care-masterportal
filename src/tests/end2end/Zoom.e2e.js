const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution, mouseWheelUp, mouseWheelDown} = require("../../../test/end2end/library/scripts"),
    {logBrowserstackUrlToTest} = require("../../../test/end2end/library/utils"),
    {initDriver} = require("../../../test/end2end/library/driver"),
    {isMobile} = require("../../../test/end2end/settings"),
    {By} = webdriver;

/**
 * Tests regarding map zooming.
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @param {Object} params.result to fill with return values to caller, e.g. info about failing
 * @returns {void}
 */
async function ZoomTests ({builder, url, resolution, capability, result}) {
    const testIsApplicable = !isMobile(resolution); // no mouse wheel on mobile devices

    if (testIsApplicable) {
        describe("Map Zoom with MouseWheel", function () {
            let driver, canvas;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
                canvas = await driver.findElement(By.css(".ol-viewport"));
            });

            after(async function () {
                if (capability) {
                    if(driver){
                        driver.session_.then(function (sessionData) {
                            logBrowserstackUrlToTest(sessionData.id_);
                        });
                    }
                    else{
                        console.log("set result fail in after in test");
                        result.fail = true; 
                    }
                }
                await driver.quit();
            });

            afterEach(async function () {
                if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
                    console.warn("      FAILED! Retrying test \"" + this.currentTest.title + "\"  after reloading url");
                    await driver.quit();
                    driver = await initDriver(builder, url, resolution);
                    canvas = await driver.findElement(By.css(".ol-viewport"));
                }
                if (this.currentTest.state === "failed") {
                    result.fail = true;
                }
            });

            it("should zoom in on mouse wheel up", async function () {
                this.timeout(15000);
                const res = await driver.executeScript(getResolution);

                /* only do-while on zoom-in since function may not be ready;
                 * zoom-out should then work immediately right after */
                do {
                    await driver.executeScript(mouseWheelUp, canvas);
                    await driver.wait(new Promise(r => setTimeout(r, 500)));
                } while (res <= await driver.executeScript(getResolution));
            });

            it("should zoom out on mouse wheel down", async function () {
                this.timeout(15000);
                const res = await driver.executeScript(getResolution);

                await driver.executeScript(mouseWheelDown, canvas);
                await driver.wait(new Promise(r => setTimeout(r, 500)));

                expect(res).to.be.below(await driver.executeScript(getResolution));
            });
        });
    }
}

module.exports = ZoomTests;
