const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isLayerVisible} = require("../../../library/scripts"),
    {reclickUntilNotStale} = require("../../../library/utils"),
    {isDefault, isCustom, isBasic} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding search categories.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function SearchCategories ({builder, url, resolution}) {
    const basicTest = isBasic(url),
        defaultCustomTest = isDefault(url) || isCustom(url);

    describe("Searchbar", function () {
        describe("Gdi Search", function () {
            const searchInputSelector = By.css("#searchInput"),
                searchString = "Alt";
            let driver, searchInput;

            before(async function () {
                driver = await initDriver(builder, url, resolution);
                await driver.wait(until.elementLocated(searchInputSelector));
                searchInput = await driver.findElement(searchInputSelector);
            });

            after(async function () {
                await driver.quit();
            });

            it(`search for '${searchString}' shows 'Thema'-suffixed result in a dropdown that can be clicked`, async function () {
                const topicSelector = By.xpath("//small[@class='list-group-item-theme'][text()='Thema']");

                await searchInput.sendKeys(searchString);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#searchInputUL"))));
                await driver.wait(until.elementLocated(topicSelector));
            });

            if (basicTest) {
                const treeSelector = By.xpath("//ul[@id='tree']"),
                    layerId = "2426",
                    listEntrySelector = By.xpath(`//li[@id='${layerId}']`),
                    checkboxSelector = By.xpath("//ul[@id='tree']//li//span[text()='Bezirke'][..//span[contains(@class,'glyphicon-check')]]");

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
                    // TODO ENABLE await driver.wait(until.elementIsVisible(await driver.findElement(checkboxSelector)));
                });
            }

            if (defaultCustomTest) {
                const layerName = isDefault(url) ? "ALKIS - Aufnahmepunktnester" : "Landesgrenze",
                    layerId = isDefault(url) ? "5697" : "2427",
                    listEntrySelector = By.xpath(`//li[@id='${layerId}']`),
                    treeSelector = By.xpath("//ul[@id='tree']"),
                    checkboxSelector = By.xpath(`//ul[@id='tree']//ul[@id='Overlayer']/li//span[contains(text(),'${layerName}')][..//span[contains(@class,'glyphicon-check')]]`),
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
                    await driver.wait(until.elementLocated(selectedLayerFirstEntrySelector));
                    expect(await (await driver.findElement(selectedLayerFirstEntrySelector)).getText()).to.contain(layerName);
                });
            }
        });
    });
}

module.exports = SearchCategories;
