/* eslint-disable one-var */

const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    fetch = require("node-fetch"),
    masterConfigJson = require("../../../../../portal/master/config.json"),
    masterConfigJs = require("../../../../../portal/master/config.js"),
    {getOrderedLayerIds, isLayerVisible} = require("../../../library/scripts"),
    {initDriver} = require("../../../library/driver"),
    {getOrderedTitleTexts, getOrderedTitlesFromConfig, getOrderedIdsFromConfig, logTestingCloudUrlToTest} = require("../../../library/utils"),
    {isMaster, isChrome} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * @param {Array.<(string|string[])>} arrayWithOptions array to compare, but each index may also hold an array of
 *                                                     options where it suffices if one equals the compareArray entry
 * @param {string[]} compareArray array to compare with
 * @returns {boolean} whether arrays match
 */
function arrayDeepEqualsWithOptions (arrayWithOptions, compareArray) {
    return arrayWithOptions.length === compareArray.length &&
        arrayWithOptions.reduce((bigAnd, current, index) => bigAnd &&
            (Array.isArray(current)
                ? current.includes(compareArray[index])
                : current === compareArray[index])
        , true);
}

/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function MenuLayersTests ({builder, url, resolution, browsername, capability}) {
    describe("Menu Layers", function () {
        let driver,
            services,
            // as seen in Map
            mapOrderedLayerIds,
            mapOrderedElementTexts,
            // as specified in configJSON
            configGivenTitleOrder,
            configGivenIdOrder;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                capability["sauce:options"].name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            services = await new Promise((resolve, reject) => fetch(masterConfigJs.layerConf)
                .then(response => response.text())
                .then(text => resolve(JSON.parse(text.trim())))
                .catch(reject)
            );
            driver = await initDriver(builder, url, resolution);

            configGivenIdOrder = getOrderedIdsFromConfig(masterConfigJson);
        });

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
            }
        });

        /*
         * Tests only work in Chrome. The scripts and utils return a different order of elements
         * for chromedriver and geckodriver. Element order is probably simply not guaranteed in WebDrivers?
         */
        if (isMaster(url) && isChrome(browsername)) {
            it("shows layers in order of config.json in LT", async function () {
                await (await driver.wait(
                    until.elementLocated(By.css("ul#root li:first-child")),
                    5000,
                    "navigation bar did not appear"
                )).click();

                const tree = await driver.wait(
                    until.elementLocated(By.css("ul#tree")),
                    5000,
                    "layer tree did not appear"
                );

                await driver.wait(
                    until.elementIsVisible(tree),
                    5000,
                    "layer tree did not become visible"
                );

                mapOrderedElementTexts = await getOrderedTitleTexts(driver);
                configGivenTitleOrder = getOrderedTitlesFromConfig(masterConfigJson, services);

                expect(arrayDeepEqualsWithOptions(configGivenTitleOrder, mapOrderedElementTexts)).to.be.true;
            });

            it("has the same layer order in tree and map in LT", async function () {
                mapOrderedLayerIds = await driver.executeScript(getOrderedLayerIds);

                expect(mapOrderedLayerIds).to.deep.equal(configGivenIdOrder);
            });

            it("allows activating and deactivating layers in LT", async function () {
                // The first layer in tree "100 jahre Stadtgruen POIS" has a transparency of "0.25"
                const checkLayerId = configGivenIdOrder[0];

                await (await driver.findElement(By.css("ul#root li.layer span.layer-item"))).click();
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.true;
                await (await driver.findElement(By.css("ul#root li.layer span.layer-item"))).click();
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.false;
                await (await driver.findElement(By.css("ul#root li.layer span.layer-item"))).click();
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.true;
            });

            it("opens an information window with the info button", async function () {
                await (await driver.findElement(By.css("ul#root li.layer span.glyphicon-info-sign"))).click();
                await driver.wait(
                    until.elementLocated(By.css("div#layerinformation-desktop")),
                    5000,
                    "Info window did not appear"
                );
            });

            describe("LT options cog", function () {
                it("displays an option row", async function () {
                    await (await driver.findElement(By.css("ul#root li.layer span.glyphicon-cog"))).click();
                    await driver.wait(
                        until.elementLocated(By.css("ul#root li.layer div.layer-settings")),
                        5000,
                        "layer settings menu did not appear upon clicking cog symbol"
                    );

                    // wait for animation to finish
                    await new Promise(r => setTimeout(r, 200));
                });

                it("allows manipulating layer transparency", async function () {
                    /**
                     * @param {string} sign must be "plus" or "minus"
                     * @returns {WebdriverWebElement} fresh transparency button
                     */
                    async function getButton (sign) {
                        return driver.findElement(By.css(`span.transparency span.glyphicon-${sign}-sign`));
                    }

                    const id = mapOrderedLayerIds[0];

                    expect(await driver.executeScript(isLayerVisible, id, "0.25")).to.be.true;

                    // buttons have to be re-fetched each click since they tend to go stale
                    await (await getButton("minus")).click();
                    await (await getButton("minus")).click();
                    await (await getButton("minus")).click();

                    expect(await driver.executeScript(isLayerVisible, id, "0.55")).to.be.true;

                    await (await getButton("plus")).click();
                    await (await getButton("plus")).click();
                    await (await getButton("plus")).click();

                    expect(await driver.executeScript(isLayerVisible, id, "0.25")).to.be.true;


                });

                it("arrows allow moving layers up in tree and map order", async function () {
                    await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.glyphicon-arrow-down"))).click();

                    const newTitleOrder = await getOrderedTitleTexts(driver),
                        newMapOrder = await driver.executeScript(getOrderedLayerIds);

                    expect(newTitleOrder[0])
                        .to.equal(mapOrderedElementTexts[1]);
                    expect(newTitleOrder[1])
                        .to.equal(mapOrderedElementTexts[0]);
                    expect(mapOrderedLayerIds[0])
                        .to.equal(newMapOrder[1]);
                    expect(mapOrderedLayerIds[1])
                        .to.equal(newMapOrder[0]);
                });

                it("arrows allow moving layers down in tree and map order", async function () {
                    await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.glyphicon-arrow-up"))).click();

                    const newTitleOrder = await getOrderedTitleTexts(driver),
                        newMapOrder = await driver.executeScript(getOrderedLayerIds),
                        lastMapOrderIndex = mapOrderedLayerIds.length - 1;

                    expect(newTitleOrder[0])
                        .to.equal(mapOrderedElementTexts[0]);
                    expect(newTitleOrder[1])
                        .to.equal(mapOrderedElementTexts[1]);
                    expect(mapOrderedLayerIds[lastMapOrderIndex - 1])
                        .to.equal(newMapOrder[lastMapOrderIndex - 1]);
                    expect(mapOrderedLayerIds[lastMapOrderIndex])
                        .to.equal(newMapOrder[lastMapOrderIndex]);
                });

                it("arrows moving up do nothing if layer is already first", async function () {
                    await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.glyphicon-arrow-up"))).click();

                    const newTitleOrder = await getOrderedTitleTexts(driver),
                        newMapOrder = await driver.executeScript(getOrderedLayerIds),
                        lastMapOrderIndex = mapOrderedLayerIds.length - 1;

                    expect(newTitleOrder[0])
                        .to.equal(mapOrderedElementTexts[0]);
                    expect(newTitleOrder[1])
                        .to.equal(mapOrderedElementTexts[1]);
                    expect(mapOrderedLayerIds[lastMapOrderIndex - 1])
                        .to.equal(newMapOrder[lastMapOrderIndex - 1]);
                    expect(mapOrderedLayerIds[lastMapOrderIndex])
                        .to.equal(newMapOrder[lastMapOrderIndex]);
                });

                it("allows removing layer from tree and map", async function () {
                    await (await driver.wait(
                        until.elementLocated(By.css("ul#root li.layer div.layer-settings span.remove-layer")),
                        5000,
                        "layer removal button did not appear in layer cog menu"
                    )).click();

                    await new Promise(r => setTimeout(r, 1000));

                    const newTitleOrder = await getOrderedTitleTexts(driver);

                    expect(newTitleOrder.length).to.equal(mapOrderedElementTexts.length - 1);
                    expect(newTitleOrder.includes(mapOrderedElementTexts[0])).to.be.false;
                    expect(await driver.executeScript(isLayerVisible, mapOrderedLayerIds[0])).to.be.false;
                });

                it("arrows moving down do nothing if layer is already last", async function () {
                    await (
                        await driver.findElement(By.css("ul#root li.layer:nth-child(28) span.glyphicon-cog"))
                    ).click();
                    await driver.wait(until.elementLocated(By.css("ul#root li.layer div.layer-settings")));

                    // wait for animation to finish
                    await new Promise(r => setTimeout(r, 200));

                    await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.glyphicon-arrow-down"))).click();

                    const newTitleOrder = await getOrderedTitleTexts(driver),
                        newMapOrder = await driver.executeScript(getOrderedLayerIds),
                        lastMapTitleOrderIndex = mapOrderedLayerIds.length - 1,
                        lastNewTitleOrderIndex = newTitleOrder.length - 1,
                        lastMapIdOrderIndex = mapOrderedElementTexts.length - 1,
                        lastNewIdOrderIndex = newMapOrder.length - 1;

                    expect(newTitleOrder[lastNewTitleOrderIndex - 1])
                        .to.equal(mapOrderedElementTexts[lastMapTitleOrderIndex - 1]);
                    expect(newTitleOrder[lastNewTitleOrderIndex])
                        .to.equal(mapOrderedElementTexts[lastMapTitleOrderIndex]);

                    expect(mapOrderedLayerIds[lastMapIdOrderIndex - 1])
                        .to.equal(newMapOrder[lastNewIdOrderIndex - 1]);
                    expect(mapOrderedLayerIds[lastMapIdOrderIndex])
                        .to.equal(newMapOrder[lastNewIdOrderIndex]);
                });
            });
        }
    });
}

module.exports = MenuLayersTests;
