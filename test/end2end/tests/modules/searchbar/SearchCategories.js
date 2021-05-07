const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {reclickUntilNotStale, logBrowserstackUrlToTest} = require("../../../library/utils"),
    {getCenter, setCenter, getResolution, setResolution, hasVectorLayerLength, hasVectorLayerStyle} = require("../../../library/scripts"),
    {isDefault} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding search categories.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function SearchCategories ({builder, url, resolution, capability}) {
    const testIsApplicable = isDefault(url); // only default config has sufficiently configured search bar for test

    if (testIsApplicable) {
        // TODO with the current configurations, none has the sufficient specialWFS set; configurations need to be expanded first
        describe.skip("Search Categories", function () {
            const searchString = "Haus",
                resultsSelector = By.css("#searchInputUL > li.results");
            let driver, searchInput, searchList, searchMarker, initialCenter, initialResolution, clear;

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

                await reopenCategories();

                // confirm mapMarker layer is initially clear to not mix existing elements up with expected elements
                expect(await driver.executeScript(hasVectorLayerLength, "mapMarker", 0)).to.be.true;

                await driver.wait(until.elementLocated(categorySelector));
                await driver.wait(until.elementIsVisible(await driver.findElement(categorySelector)));
                /** sometimes needs another click to really open; retry after 100ms if it didn't work */
                do {
                    await (await driver.findElement(categorySelector)).click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(categoryOpenSelector)).length === 0);

                await driver.wait(until.elementIsVisible(await driver.findElement(entrySelector)));
                await reclickUntilNotStale(driver, entrySelector);

                if (movesCenter) {
                    await driver.wait(async () => initialCenter !== await driver.executeScript(getCenter));
                }
                if (changesResolution) {
                    await driver.wait(async () => initialResolution !== await driver.executeScript(getResolution));
                }
                await driver.wait((setsMarker ? until.elementIsVisible : until.elementIsNotVisible)(searchMarker));

                await driver.wait(async () => driver.executeScript(hasVectorLayerLength, "mapMarker", showsPolygon ? 1 : 0));
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
                searchMarker = await driver.findElement(By.css("#searchMarker"));
                searchList = await driver.findElement(By.css("#searchInputUL"));
                clear = await driver.findElement(By.css("#searchbar span.form-control-feedback"));
                initialCenter = await driver.executeScript(getCenter);
                initialResolution = await driver.executeScript(getCenter);
            }

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
                await driver.wait(async () => await driver.findElements(By.css("#searchInputUL > li.list-group-item.type > span.badge")).length !== 0);
            });

            it("has a map marker layer that uses green polygons", async function () {
                expect(await driver.executeScript(hasVectorLayerStyle, "mapMarker", {
                    fill: {color: [8, 119, 95, 0.3]},
                    stroke: {color: "#08775f"}
                })).to.be.true;
            });

            it("category 'festgestellt' shows results; on click, zooms to the place and marks it with polygon", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
                    showsPolygon: true,
                    movesCenter: true,
                    idPart: "festgestellt"
                });
            });

            it("category 'im Verfahren' shows results; on click, zooms to the place and marks it with polygon", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
                    showsPolygon: true,
                    movesCenter: true,
                    idPart: "im Verfahren"
                });
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

            it("category 'Ort' shows results; on click, zooms to the place and marks it with a marker, changes resolution", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    changesResolution: true,
                    categoryName: "Ort",
                    idPart: "bkgSuggest"
                });
            });

            it("category 'Straße' shows results; on click, zooms to the place, changes resolution", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
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
