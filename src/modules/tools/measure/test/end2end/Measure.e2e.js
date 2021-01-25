const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {hasVectorLayerLength} = require("../../../../../../test/end2end/library/scripts"),
    {reclickUntilNotStale, logBrowserstackUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {isMobile, is3D, isBasic} = require("../../../../../../test/end2end/settings"),
    {By} = webdriver;

/**
 * Tests regarding measure tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function MeasureTests ({builder, url, resolution, mode, capability}) {
    const testIsApplicable = !isMobile(resolution) && isBasic(url);

    if (testIsApplicable) {
        describe("Measure Tool", function () {
            if (!is3D(mode)) {
                describe("2D measurement", function () {
                    let driver, selectGeometry, selectUnit, deleteButton, viewport, overlays;

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

                        selectGeometry = await driver.findElement(By.id("measure-tool-geometry-select"), 5000);
                        selectUnit = await driver.findElement(By.id("measure-tool-unit-select"), 5000);
                        deleteButton = await driver.findElement(By.id("measure-delete"), 5000);

                        await driver.wait(
                            async () => ["Strecke\nFläche", "Distance\nArea"].includes(await selectGeometry.getText()),
                            5000,
                            "Geometry select had unexpected content."
                        );
                        await driver.wait(
                            async () => await selectUnit.getText() === "m\nkm",
                            5000,
                            "Unit select had unexpected content."
                        );
                    });

                    it("draws a line showing length in meters and a tooltip", async function () {
                        viewport = await driver.findElement(By.css(".ol-viewport"));

                        await driver.actions({bridge: true})
                            .move({origin: viewport})
                            .click()
                            .move({origin: viewport, x: 50, y: 50})
                            .click()
                            .perform();

                        overlays = await driver.findElements(By.css(".ol-tooltip-measure.measure-tooltip"));
                        expect((/\d+ m\n.+/).test(await overlays[0].getText())).to.be.true;
                    });

                    it("ends drawing a line on double-click showing length in meters without tooltip", async function () {
                        await driver.actions({bridge: true})
                            .move({origin: viewport, x: -50, y: 50})
                            .doubleClick()
                            .perform();

                        overlays = await driver.findElements(By.css(".ol-tooltip-measure.measure-tooltip"));
                        expect((/\d+ m/).test(await overlays[overlays.length - 1].getText())).to.be.true;
                    });

                    it("allows deleting made measurements by clicking the deletion button", async function () {
                        expect(await driver.executeScript(hasVectorLayerLength, "measure_layer", 0)).to.be.false;
                        await deleteButton.click();
                        expect(await driver.executeScript(hasVectorLayerLength, "measure_layer", 0)).to.be.true;
                    });

                    it("draws a polygon, ending in double-click, displaying area in meters² and deviation", async function () {
                        await (
                            await driver.findElement(
                                By.css("#measure-tool-geometry-select option:last-child")
                            )
                        ).click();

                        viewport = await driver.findElement(By.css(".ol-viewport"));

                        await driver.actions({bridge: true})
                            .move({origin: viewport, x: 0, y: 40}).click()
                            .move({origin: viewport, x: -40, y: 0}).click()
                            .move({origin: viewport, x: -20, y: -20}).click()
                            .move({origin: viewport}).click()
                            .move({origin: viewport, x: 20, y: -20}).click()
                            .move({origin: viewport, x: 40, y: 0}).doubleClick()
                            .perform();

                        overlays = await driver.findElements(By.css(".ol-tooltip-measure.measure-tooltip"));
                        expect((/\d+(\.\d+)? m²/).test(await overlays[overlays.length - 1].getText())).to.be.true;
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

                        await driver.wait(async () => driver.executeScript(() => {
                            /* was areRegExpsInMeasureLayer, should now check for olcs overlay*/
                        }, [
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
