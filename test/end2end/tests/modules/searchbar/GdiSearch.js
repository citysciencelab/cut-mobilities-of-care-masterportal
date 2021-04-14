const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isLayerVisible} = require("../../../library/scripts"),
    {reclickUntilNotStale, logBrowserstackUrlToTest} = require("../../../library/utils"),
    {isCustom, isMaster} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding gdi search.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function GdiSearch ({builder, url, resolution, capability}) {
    describe.skip("Gdi Search", function () {
        const searchInputSelector = By.css("#searchInput"),
            searchString = "Alt",
            layerName = "Altbestand",
            layerId = "1571";
        let driver, searchInput;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await initDriver(builder, url, resolution);
            await driver.wait(until.elementLocated(searchInputSelector), 5000);
            searchInput = await driver.findElement(searchInputSelector);
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
                await driver.wait(until.elementLocated(searchInputSelector), 5000);
                searchInput = await driver.findElement(searchInputSelector);
            }
        });

        if (isMaster(url) || isCustom(url)) {
            it(`search for '${searchString}' shows 'Fachthema'-suffixed result in a dropdown that can be clicked`, async function () {
                const topicSelector = By.xpath("//small[@class='list-group-item-theme'][text()='Fachthema']");

                await searchInput.sendKeys(searchString);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#searchInputUL"))));
                await driver.wait(until.elementLocated(topicSelector), 5000);
            });
        }

        if (isMaster(url)) {
            const treeSelector = By.xpath("//ul[@id='tree']"),
                listEntrySelector = By.xpath(`//li[@id='${layerId}']`),
                checkboxSelector = By.xpath(`//ul[@id='tree']//li//span[text()='${layerName}'][..//span[contains(@class,'glyphicon-check')]]`);

            it("renders the chosen layer", async function () {
                // needs multiple clicks in FF in case the associated function is not ready yet
                do {
                    await reclickUntilNotStale(driver, listEntrySelector);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while (!await (await driver.findElement(treeSelector)).isDisplayed());
                expect(await driver.executeScript(isLayerVisible, layerId)).to.be.true;
            });

            it("shows the selection in the topic tree", async function () {
                await driver.wait(until.elementIsVisible(await driver.findElement(treeSelector)));
                await driver.wait(until.elementIsVisible(await driver.findElement(checkboxSelector)));
            });
        }

        if (isCustom(url)) {
            const listEntrySelector = By.xpath(`//li[@id='${layerId}']`),
                treeSelector = By.xpath("//ul[@id='tree']"),
                checkboxSelector = By.xpath(`//ul[@id='tree']//ul[@id='ExternalLayer']/li//span[contains(text(),'${layerName}')][..//span[contains(@class,'glyphicon-check')]]`),
                selectedLayerGlyphSelector = By.css(".SelectedLayer .glyphicon-plus-sign"),
                selectedLayerFirstEntrySelector = By.css("#SelectedLayer .layer-item:nth-child(1) .layer-item .title");

            it("renders the chosen layer", async function () {
                const treeButton = await driver.findElement(By.xpath("//span[contains(.,'Themen')]")),
                    tree = await driver.findElement(treeSelector);

                while (isCustom(url) && await tree.isDisplayed()) {
                    // close topic tree initially to see if it opens correctly
                    await treeButton.click();
                }

                // needs multiple clicks in FF in case the associated function is not ready yet
                do {
                    await reclickUntilNotStale(driver, listEntrySelector);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while (!await tree.isDisplayed());

                await driver.wait(async () => driver.executeScript(isLayerVisible, layerId), 10000, "Layer was not shown.");
            });

            it("selects and shows the layer in 'Fachdaten'", async function () {
                await driver.wait(until.elementIsVisible(await driver.findElement(treeSelector)));
                await driver.wait(until.elementIsVisible(await driver.findElement(checkboxSelector)));
            });

            it("selects the layer as first layer in 'Selected Layers'", async function () {
                await (await driver.findElement(selectedLayerGlyphSelector)).click();
                await driver.wait(until.elementLocated(selectedLayerFirstEntrySelector), 5000);
                expect(await (await driver.findElement(selectedLayerFirstEntrySelector)).getText()).to.contain(layerName);
            });
        }
    });
}

module.exports = GdiSearch;
