const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {areRegExpsInMeasureLayer, hasVectorLayerLength, getCoordinatesOfXthFeatureInLayer} = require("../../../library/scripts"),
    {reclickUntilNotStale, logBrowserstackUrlToTest} = require("../../../library/utils"),
    {isMobile, is3D} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding measure tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function MeasureTests ({builder, url, resolution, mode, capability}) {
    const testIsApplicable = !isMobile(resolution);

    if (testIsApplicable) {
        describe("Measure Tool", function () {
            if (!is3D(mode)) {
                describe("2D measurement", function () {
                    let driver, dropdownGeometry, dropdownUnit, questionIcon, deleteButton, viewport;

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

                    it("opens a widget with distance/meters preconfigured for geometry/unit", async function () {
                        await reclickUntilNotStale(driver, By.xpath("//ul[@id='tools']//.."));
                        await (await driver.findElement(By.css("#tools .glyphicon-resize-full"))).click();

                        dropdownGeometry = await driver.findElement(By.css("#window .dropdown_geometry .filter-option"));
                        dropdownUnit = await driver.findElement(By.css("#window .dropdown_unit .filter-option"));
                        questionIcon = await driver.findElement(By.css("#window .glyphicon.glyphicon-question-sign"));
                        deleteButton = await driver.findElement(By.css("div#window button.measure-delete"));

                        await driver.wait(async () => ["Strecke", "Distance"].includes(await dropdownGeometry.getText()));
                        await driver.wait(async () => await dropdownUnit.getText() === "m");
                    });

                    it("draws a line showing length in meters and deviation", async function () {
                        viewport = await driver.findElement(By.css(".ol-viewport"));
                        await driver.actions({bridge: true})
                            .move({origin: viewport})
                            .click()
                            .move({origin: viewport, x: 50, y: 50})
                            .click()
                            .perform();

                        expect(await driver.executeScript(areRegExpsInMeasureLayer, [
                            "\\d+\\.\\d+ m",
                            "\\(\\+\\/- \\d+\\.\\d+ m\\)"
                        ])).to.be.true;
                    });

                    it("ends drawing a line on double-click showing length in meters and deviation", async function () {
                        await driver.actions({bridge: true})
                            .move({origin: viewport, x: -50, y: 50})
                            .doubleClick()
                            .perform();

                        expect(await driver.executeScript(areRegExpsInMeasureLayer, [
                            "\\d+\\.\\d+ m",
                            "\\(\\+\\/- \\d+\\.\\d+ m\\)"
                        ])).to.be.true;

                        expect(await driver.executeScript(getCoordinatesOfXthFeatureInLayer, 1, "measure_layer")).to.have.length(3);
                    });

                    it.skip("displays start and end points of line measurements bigger than support points", async function () {
                        // TODO A unit test is probably enough; no way comes to mind to directly test the visuals.
                    });

                    it("allows deleting made measurements by clicking the deletion button", async function () {
                        expect(await driver.executeScript(hasVectorLayerLength, "measure_layer", 0)).to.be.false;
                        await deleteButton.click();
                        expect(await driver.executeScript(hasVectorLayerLength, "measure_layer", 0)).to.be.true;
                    });

                    it("changing geometry mode also changes available units", async function () {
                        await dropdownUnit.click();
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='m']"))).to.have.length(1);
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='km']"))).to.have.length(1);
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='m²']"))).to.be.empty;
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='km²']"))).to.be.empty;

                        await dropdownGeometry.click();
                        await (await driver.findElement(By.css(".dropdown_geometry ul li:last-child"))).click();
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='m']"))).to.be.empty;
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='km']"))).to.be.empty;
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='m²']"))).to.have.length(1);
                        expect(await driver.findElements(By.xpath("//li//span[contains(@class,'text')][text()='km²']"))).to.have.length(1);
                    });

                    it("draws a polygon, ending in double-click, displaying area in meters² and deviation", async function () {
                        viewport = await driver.findElement(By.css(".ol-viewport"));
                        await driver.actions({bridge: true})
                            .move({origin: viewport, x: 0, y: 40}).click()
                            .move({origin: viewport, x: -40, y: 0}).click()
                            .move({origin: viewport, x: -20, y: -20}).click()
                            .move({origin: viewport}).click()
                            .move({origin: viewport, x: 20, y: -20}).click()
                            .move({origin: viewport, x: 40, y: 0}).doubleClick()
                            .perform();

                        expect(await driver.executeScript(areRegExpsInMeasureLayer, [
                            "\\d+(\\.\\d+)? m²",
                            "\\(\\+\\/- \\d+(\\.\\d+)? m²\\)"
                        ])).to.be.true;
                    });

                    it.skip("displays start and end points of polygon measurements bigger than support points", async function () {
                        // TODO A unit test is probably enough; no way comes to mind to directly test the visuals.
                    });

                    it("provides a quickhelp", async function () {
                        await questionIcon.click();
                        await driver.wait(until.elementIsVisible(await driver.findElement(By.css(".quick-help-window"))));
                        expect(await driver.findElements(By.css(".quick-help-window img"))).to.have.length(5);
                    });
                });
            }

            if (is3D(mode)) {
                // TODO 3D mode currently not active in pipeline; update tests when they are
                describe("3D measurement", function () {
                    let driver, dropdownGeometry, dropdownUnit, viewport;

                    before(async function () {
                        driver = await initDriver(builder, url, resolution, mode);
                    });

                    after(async function () {
                        await driver.quit();
                    });

                    it("sets 3D measurement option in 3D mode", async function () {
                        await (await driver.findElement(By.xpath("//ul[@id='root']//a[contains(.,'Werkzeuge')]"))).click();
                        await (await driver.findElement(By.xpath("//a[contains(.,'Strecke / Fläche messen')]"))).click();

                        dropdownGeometry = await driver.findElement(By.css("#window .dropdown_geometry .filter-option"));
                        dropdownUnit = await driver.findElement(By.css("#window .dropdown_unit .filter-option"));

                        await driver.wait(async () => await dropdownGeometry.getText() === "3D Messen");
                        await driver.wait(async () => await dropdownUnit.getText() === "m");
                    });

                    it("measures vertical and horizontal distance of line points in 3D mode", async function () {
                        viewport = await driver.findElement(By.css(".ol-viewport"));

                        await driver.actions({bridge: true})
                            .move({origin: viewport, x: 0, y: -10}).click()
                            .move({origin: viewport, x: 0, y: 10}).click()
                            .perform();

                        await driver.wait(async () => driver.executeScript(areRegExpsInMeasureLayer, [
                            "Länge: \\d+(\\.\\d+)?m",
                            "Höhe: \\d+(\\.\\d+)?m"
                        ]));
                    });
                });
            }
        });
    }
}

module.exports = MeasureTests;
