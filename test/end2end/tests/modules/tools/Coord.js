const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isMobile, isBasic} = require("../../../settings"),
    namedProjectionsBasic = require("../../../resources/configs/basic/config").namedProjections,
    namedProjectionsDefault = require("../../../resources/configs/default/config").namedProjections,
    namedProjectionsCustom = require("../../../resources/configs/custom/config").namedProjections,
    {By, until, Key} = webdriver;

/**
 * Tests regarding coord tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function CoordTests ({builder, url, resolution}) {
    describe("Coord", function () {
        const selectors = {
            tools: By.xpath("//span[contains(.,'Werkzeuge')]"),
            toolCoord: By.xpath("//a[contains(.,'Koordinaten abfragen')]"),
            modal: By.xpath("//div[@id='window']"),
            header: By.xpath("//div[@id='window']//span[contains(.,'Koordinaten abfragen')]"),
            coordSystemLabel: By.xpath("//label[contains(.,'Koordinatensystem')]"),
            coordSystemSelect: By.xpath("//select[@id='coordSystemField']"),
            eastingLabel: By.xpath("//label[@id='coordinatesEastingLabel']"),
            eastingField: By.xpath("//input[@id='coordinatesEastingField']"),
            northingLabel: By.xpath("//label[@id='coordinatesNorthingLabel']"),
            northingField: By.xpath("//input[@id='coordinatesNorthingField']"),
            wgs84Option: By.xpath("//option[contains(.,'WGS 84 (long/lat)')]"),
            utm32nOption: By.xpath("//option[contains(.,'ETRS89/UTM 32N')]"),
            searchMarker: By.xpath("//div[@id='searchMarker']"),
            searchMarkerContainer: By.xpath("//div[div[@id='searchMarker']]"),
            viewport: By.css(".ol-viewport")
        };
        let driver, searchMarkerContainer, viewport, eastingField, northingField;

        /**
         * Repeatable parameterized workflow.
         * @param {object} params parameter object
         * @param {boolean} [params.clickAfterFirstMove=false] if true, will click after first mouse move
         * @param {boolean} [params.expectUnchanged=false] if true, will expect values for east, north, and marker style to be unchanges
         * @returns {void}
         */
        async function moveAndClickAndCheck ({clickAfterFirstMove = false, expectUnchanged = false}) {
            let firstMove = driver.actions({bridge: true})
                .move({origin: viewport, x: -50, y: -50});

            firstMove = clickAfterFirstMove ? firstMove.click() : firstMove;

            await firstMove.perform();

            const eastValue = await eastingField.getAttribute("value"),
                northValue = await northingField.getAttribute("value"),
                searchMarkerPosition = await searchMarkerContainer.getAttribute("style");

            await driver.actions({bridge: true})
                .move({origin: viewport, x: 50, y: 50})
                .perform();

            expect(eastValue)[expectUnchanged ? "to" : "not"].equal(await eastingField.getAttribute("value"));
            expect(northValue)[expectUnchanged ? "to" : "not"].equal(await northingField.getAttribute("value"));
            expect(searchMarkerPosition)[expectUnchanged ? "to" : "not"].equal(await searchMarkerContainer.getAttribute("style"));
        }

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("displays a modal dialog containing the tool elements", async () => {
            const tools = await driver.findElement(selectors.tools),
                toolCoord = await driver.findElement(selectors.toolCoord);

            await driver.wait(until.elementIsVisible(tools));
            while (!await toolCoord.isDisplayed()) {
                await tools.click();
                await driver.wait(new Promise(r => setTimeout(r, 100)));
            }
            await toolCoord.click();

            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)));

            await driver.wait(until.elementLocated(selectors.header));
            await driver.wait(until.elementLocated(selectors.coordSystemLabel));
            await driver.wait(until.elementLocated(selectors.coordSystemSelect));
            await driver.wait(until.elementLocated(selectors.eastingLabel));
            await driver.wait(until.elementLocated(selectors.eastingField));
            await driver.wait(until.elementLocated(selectors.northingLabel));
            await driver.wait(until.elementLocated(selectors.northingField));

            viewport = await driver.findElement(selectors.viewport);
            searchMarkerContainer = await driver.findElement(selectors.searchMarkerContainer);
            eastingField = await driver.findElement(selectors.eastingField);
            northingField = await driver.findElement(selectors.northingField);
        });

        it("the displayed coordinates and map marker position change on mouse movement", async () => {
            await moveAndClickAndCheck({});
        });

        it("after click, coordinates and marker are frozen despite further mouse movement", async () => {
            await moveAndClickAndCheck({
                clickAfterFirstMove: true,
                expectUnchanged: true
            });
        });

        if (isMobile(url)) {
            it("after another click, coordinates and marker move to new position without sticking to the mouse", async () => {
                await moveAndClickAndCheck({
                    clickAfterFirstMove: true,
                    expectUnchanged: true
                });
            });
        }
        else {
            it("after another click, coordinates and marker stick to mouse again", async () => {
                await moveAndClickAndCheck({
                    clickAfterFirstMove: true
                });
            });
        }

        it("copies coordinate values on click to clipboard", async () => {
            /* Since there seems to be no universally supported way to check what
             * Strg+V produces, we're just dumping the information to the search
             * bar and check if the expected value arrived. */
            const searchInput = await driver.findElement(By.css("#searchInput"));

            for (const field of [northingField, eastingField]) {
                const value = await field.getAttribute("value");

                // first click sometimes ignored as driver tends to get stuck on search field
                await field.click();
                await field.click();
                await driver.wait(new Promise(r => setTimeout(r, 100)));
                await searchInput.sendKeys(Key.CONTROL, "v");

                expect(await searchInput.getAttribute("value")).to.equal(value);
                await searchInput.clear();
            }
        });

        it("offers the configured coordinate systems", async () => {
            const namedProjections = {
                    default: namedProjectionsDefault,
                    custom: namedProjectionsCustom,
                    basic: namedProjectionsBasic
                }[url.split("/").pop()],
                titles = namedProjections.map(a => a[1].split("+title=").pop().split(" +")[0]);

            // all configured systems exist
            for (const title of titles) {
                expect(await driver.findElement(By.xpath(`//select[@id='coordSystemField']//option[contains(.,'${title}')]`))).to.exist;
            }

            // the amount of available systems equals the amount of configures systems
            expect(await driver.findElements(By.xpath("//select[@id='coordSystemField']//option"))).to.have.length(titles.length);
        });

        it("displays values according to chosen coordinate system", async () => {
            if (!isBasic(url)) {
                await (await driver.findElement(selectors.coordSystemSelect)).click();
                await (await driver.findElement(selectors.wgs84Option)).click();

                expect(await northingField.getAttribute("value")).to.match(/\d{1,2}° \d{1,2}′ \d{1,2}″ E/g);
                expect(await eastingField.getAttribute("value")).to.match(/\d{1,2}° \d{1,2}′ \d{1,2}″ N/g);
            }

            await (await driver.findElement(selectors.coordSystemSelect)).click();
            await (await driver.findElement(selectors.utm32nOption)).click();

            expect(await northingField.getAttribute("value")).to.match(/\d{7}\.\d{2}/g);
            expect(await eastingField.getAttribute("value")).to.match(/\d{6}\.\d{2}/g);
        });
    });
}

module.exports = CoordTests;
