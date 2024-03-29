const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {reclickUntilNotStale, logTestingCloudUrlToTest} = require("../../../library/utils"),
    {getCenter, setCenter, getResolution, setResolution, hasVectorLayerLength, hasVectorLayerStyle} = require("../../../library/scripts"),
    {isMaster} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding search categories.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function SearchCategories ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        // TODO with the current configurations, none has the sufficient specialWFS set; configurations need to be expanded first
        describe("Search Categories", function () {
            const searchString = "Haus",
                resultsSelector = By.css("#searchInputUL > li.results");
            let driver, searchInput, searchList, initialCenter, initialResolution, clear;

            /**
             * Clears search bar (if necessary), re-enters search word, opens category view.
             * @returns {void}
             */
            async function reopenCategories () {
                if (await clear.isDisplayed()) {
                    await clear.click();
                }
                await driver.executeScript(setResolution, initialResolution);
                await driver.executeScript(setCenter, initialCenter);

                await searchInput.sendKeys(searchString);
                await driver.wait(until.elementIsVisible(searchList));
                /* clicking this element may do nothing (especially in Firefox) when
                * searches are still running; to circumvent this issue, the element
                * is clicked until it's no longer found, assuming the category
                * menu was opened */
                do {
                    await reclickUntilNotStale(driver, resultsSelector);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(resultsSelector)).length);
            }

            /**
             * Clicks a hit from a search category and verifies expected behaviour occurs.
             * @param {object} params parameter object
             * @param {boolean} params.setMarker if true, checks if marker is visible
             * @param {boolean} params.showsPolygon if true, checks if polygon is set in mapMarker layer
             * @param {boolean} params.movesCenter if true, checks if center point moved (assuming it was set to initialCenter beforehand)
             * @param {boolean} params.changesResolution if true, checks if resolution changed (assuming it was set to initialResolution beforehand)
             * @param {boolean} [params.categoryName=idPart] if set, will be used to search for the category label; else, idPart is used
             * @param {boolean} params.idPart part of the id for hits sufficient for identifying it
             * @returns {void}
             */
            async function selectAndVerifyFirstHit ({setsMarker, showsPolygon, movesCenter, changesResolution, categoryName, idPart}) {
                const categorySelector = By.xpath(`//li[contains(@class,'type')][contains(.,'${categoryName || idPart}')]`),
                    categoryOpenSelector = By.xpath(`//li[contains(@class,'type')][contains(@class,'open')][contains(.,'${categoryName || idPart}')]`),
                    entrySelector = By.xpath(`//li[contains(@id,'${idPart}')][contains(@class,'hit')]`);
                let marker = null;

                if (setsMarker) {
                    marker = "markerPoint";
                }
                else if (showsPolygon) {
                    marker = "markerPolygon";
                }

                await reopenCategories();

                await driver.wait(until.elementLocated(categorySelector), 12000);
                await driver.wait(until.elementIsVisible(await driver.findElement(categorySelector)));

                /** sometimes needs another click to really open; retry after 100ms if it didn't work */
                do {
                    await (await driver.findElement(categorySelector)).click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(categoryOpenSelector)).length === 0);

                await driver.wait(until.elementIsVisible(await driver.findElement(entrySelector)), 12000);
                await reclickUntilNotStale(driver, entrySelector);

                if (movesCenter) {
                    await driver.wait(async () => initialCenter !== await driver.executeScript(getCenter), 12000);
                }
                if (changesResolution) {
                    await driver.wait(async () => initialResolution !== await driver.executeScript(getResolution), 12000);
                }

                await driver.wait(async () => driver.executeScript(hasVectorLayerLength, marker, marker !== null ? 1 : 0), 9000);
            }

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    capability["sauce:options"].name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
                await init();
            });

            /**
             * provides some elements
             * @returns {void}
             */
            async function init () {
                const searchInputSelector = By.css("#searchInput");

                await driver.wait(until.elementLocated(searchInputSelector));
                searchInput = await driver.findElement(searchInputSelector);
                searchList = await driver.findElement(By.css("#searchInputUL"));
                clear = await driver.findElement(By.css("#searchbar span.form-control-feedback"));
                initialCenter = await driver.executeScript(getCenter);
                initialResolution = await driver.executeScript(getResolution);
            }

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
                    await init();
                }
            });

            it("searches show some results in a dropdown", async function () {
                await searchInput.sendKeys(searchString);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#searchInputUL"))));
                expect(await driver.findElements(By.css("#searchInputUL > li.hit"))).to.have.length(5);
                expect(await driver.findElements(By.css("#searchInputUL > li.results"))).to.have.length(1);
            });

            it("provides all results aggregated by categories, including sum of hits per category", async function () {
                await (await driver.findElement(By.css("#searchInputUL > li.results"))).click();
                expect(await driver.findElements(By.css("#searchInputUL > li.list-group-item.type > span.badge"))).to.not.equals(0);
            });

            it("category 'festgestellt' shows results; on click, zooms to the place and marks it with polygon", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
                    showsPolygon: true,
                    movesCenter: true,
                    idPart: "festgestellt"
                });

                expect(await driver.executeScript(hasVectorLayerStyle, "markerPolygon", {
                    fill: {color: [8, 119, 95, 0.3]},
                    stroke: {color: [8, 119, 95, 1]}
                })).to.be.true;
            });

            it("category 'B-Plan' shows results; on click, zooms to the place and marks it with polygon", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
                    showsPolygon: true,
                    movesCenter: true,
                    idPart: "B-Plan"
                });

                expect(await driver.executeScript(hasVectorLayerStyle, "markerPolygon", {
                    fill: {color: [8, 119, 95, 0.3]},
                    stroke: {color: [8, 119, 95, 1]}
                })).to.be.true;
            });

            // NOTE using this instead of 'Krankenhaus' since I can't find the KH search
            it("category 'Kita' shows results; on click, zooms to the place and marks it with a marker", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    idPart: "Kita"
                });
            });

            it("category 'Straße' shows results; on click, zooms to the place, changes resolution", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    changesResolution: true,
                    idPart: "Straße"
                });
            });

            it("category 'Stadtteil' shows results; on click, zooms to the place and marks it with a marker, changes resolution", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    changesResolution: true,
                    idPart: "Stadtteil"
                });
            });
        });
    }
}

module.exports = SearchCategories;
