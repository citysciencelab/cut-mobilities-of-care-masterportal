const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {getCenter} = require("../../../library/scripts"),
    {isDefault, isCustom} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding parcel search feature.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ParcelSearchTests ({builder, url, resolution}) {
    const skip = !(isDefault(url) || isCustom(url));

    (skip ? describe.skip : describe)("ParcelSearch", function () {
        const selectors = {
            tools: By.xpath("//span[contains(.,'Werkzeuge')]"),
            toolParcelSearch: By.xpath("//a[contains(.,'Flurstückssuche')]"),
            modal: By.xpath("//div[@id='window']"),
            districtLabel: By.xpath("//label[contains(.,'Gemarkung')]"),
            districtField: By.xpath("//select[@id='districtField']"),
            parcelLabel: By.xpath("//label[contains(.,'Flurstücksnummer')]"),
            parcelField: By.xpath("//input[@id='parcelField']"),
            searchMarker: By.xpath("//div[@id='searchMarker']"),
            submitButton: By.xpath("//button[@id='submitbutton']"),
            minimize: By.css("#window .glyphicon-minus"),
            maximize: By.css("#window p.title")
        };
        let driver, searchMarker, districtField, parcelField, submitButton;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("opens a modal on activation providing subdistrict and parcel input elements", async () => {
            const tools = await driver.findElement(selectors.tools),
                toolParcelSearch = await driver.findElement(selectors.toolParcelSearch);

            await driver.wait(until.elementIsVisible(tools));
            while (!await toolParcelSearch.isDisplayed()) {
                await tools.click();
                await driver.wait(new Promise(r => setTimeout(r, 100)));
            }
            await toolParcelSearch.click();

            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)));
            await driver.wait(until.elementLocated(selectors.districtField));
            await driver.wait(until.elementLocated(selectors.districtLabel));
            await driver.wait(until.elementLocated(selectors.parcelLabel));
            await driver.wait(until.elementLocated(selectors.parcelField));
        });

        it("centers map on and sets marker to parcel after choosing subdistrict and entering a parcel number", async () => {
            searchMarker = await driver.findElement(selectors.searchMarker);
            districtField = await driver.findElement(selectors.districtField);
            parcelField = await driver.findElement(selectors.parcelField);
            submitButton = await driver.findElement(selectors.submitButton);

            expect(await searchMarker.isDisplayed()).to.be.false;

            await driver.wait(until.elementIsVisible(districtField));
            await districtField.click();
            await (await driver.findElement(By.xpath("//option[@value='0601']"))).click(); // Allermöhe

            await parcelField.sendKeys("6660");
            await submitButton.click();

            await driver.wait(until.elementIsVisible(searchMarker), 5000, "Search marker was not made visible.");
            expect(await driver.executeScript(getCenter)).to.deep.equal([576184.954, 5927013.002]);
        });

        it("can be minimized", async () => {
            const minimize = await driver.findElement(selectors.minimize);

            await minimize.click();

            await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("#window .win-body"))));
            await driver.wait(async () => (await driver.findElements(By.css("#window .win-heading.header-min"))).length === 1);
            expect(await districtField.isDisplayed()).to.be.false;
            expect(await parcelField.isDisplayed()).to.be.false;
            expect(await submitButton.isDisplayed()).to.be.false;
        });

        it("can be maximized again", async () => {
            const maximize = await driver.findElement(selectors.maximize);

            await maximize.click();

            await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#window .win-body"))));
            await driver.wait(async () => (await driver.findElements(By.css("#window .win-heading.header-min"))).length === 0);
            expect(await districtField.isDisplayed()).to.be.true;
            expect(await parcelField.isDisplayed()).to.be.true;
            expect(await submitButton.isDisplayed()).to.be.true;
        });

        it.skip("offers additional selection with extended configuration", async () => {
            // TODO get a fitting configuration; may e.g. use DT for this case, and CT for cases above
            // -> Es wird eine Auswahlliste für Gemarkungen angezeigt
            // -> Darunter wird ein Inputfeld für Flur angezeigt
            // -> Darunter wird ein Inputfeld für Flurstücksnummern angezeigt
            // Zusatz: Die Elemente werden auch ausprobiert
        });
    });
}

module.exports = ParcelSearchTests;
