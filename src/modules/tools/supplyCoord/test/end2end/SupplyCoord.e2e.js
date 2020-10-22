const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {reclickUntilNotStale, logBrowserstackUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {isMobile, isBasic} = require("../../../../../../test/end2end/settings"),
    namedProjectionsBasic = require("../../../../../../portal/basic/config").namedProjections,
    namedProjectionsMaster = require("../../../../../../portal/master/config").namedProjections,
    namedProjectionsCustom = require("../../../../../../portal/masterCustom/config").namedProjections,
    namedProjectionsDefault = require("../../../../../../portal/masterDefault/config").namedProjections,
    {By, until, Key} = webdriver;

/**
 * Tests regarding coord tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function CoordTests ({builder, url, resolution, config, capability}) {
    describe("SupplyCoord", function () {
        const selectors = {
            tools: By.xpath("//ul[@id='tools']/.."),
            toolCoord: By.css("ul#tools span.glyphicon-screenshot"),
            modal: By.css("div.tool-window-vue"),
            header: By.css("div.tool-window-vue p.title span"),
            coordSystemLabel: By.xpath("//label[@for='coordSystemField']"),
            coordSystemSelect: By.css("select#coordSystemField"),
            eastingLabel: By.css("label#coordinatesEastingLabel"),
            eastingField: By.css("input#coordinatesEastingField"),
            northingLabel: By.css("label#coordinatesNorthingLabel"),
            northingField: By.css("input#coordinatesNorthingField"),
            wgs84Option: By.xpath("//option[contains(.,'WGS 84 (long/lat)')]"),
            utm32nOption: By.xpath("//option[contains(.,'ETRS89/UTM 32N')]"),
            searchMarker: By.css("div#searchMarker"),
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
                searchMarkerPosition = await searchMarkerContainer.getAttribute("style"),
                expectPhrase = expectUnchanged ? "to" : "not";

            await driver.actions({bridge: true})
                .move({origin: viewport, x: 50, y: 50})
                .perform();

            expect(eastValue)[expectPhrase].equal(await eastingField.getAttribute("value"));
            expect(northValue)[expectPhrase].equal(await northingField.getAttribute("value"));
            expect(searchMarkerPosition)[expectPhrase].equal(await searchMarkerContainer.getAttribute("style"));
        }

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

        it("displays a modal dialog containing the tool elements", async () => {
            // can't keep tools/toolCoord as variable - tends to go stale in /portal/basic
            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.tools)));
            while (!await (await driver.findElement(selectors.toolCoord)).isDisplayed()) {
                await reclickUntilNotStale(driver, selectors.tools);
                await driver.wait(new Promise(r => setTimeout(r, 100)));
            }
            await (await driver.findElement(selectors.toolCoord)).click();

            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)));

            await driver.wait(until.elementLocated(selectors.header), 5000);

            await driver.wait(until.elementLocated(selectors.coordSystemLabel), 5000);
            await driver.wait(until.elementLocated(selectors.coordSystemSelect), 5000);

            await driver.wait(until.elementLocated(selectors.eastingLabel), 5000);
            eastingField = await driver.wait(until.elementLocated(selectors.eastingField), 5000);

            await driver.wait(until.elementLocated(selectors.northingLabel), 5000);
            northingField = await driver.wait(until.elementLocated(selectors.northingField), 5000);

            searchMarkerContainer = await driver.findElement(selectors.searchMarkerContainer);
            viewport = await driver.findElement(selectors.viewport);

            // /portal/basic sometimes requires setup time until all events are registered
            await driver.wait(new Promise(r => setTimeout(r, 1000)));
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
            it("mobile: coordinates and marker move to new position without sticking to the 'mouse'", async () => {
                await moveAndClickAndCheck({
                    clickAfterFirstMove: true,
                    expectUnchanged: true
                });
            });
        }
        else {
            it("desktop: after another click, coordinates and marker stick to mouse again", async () => {
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
                    basic: namedProjectionsBasic,
                    master: namedProjectionsMaster,
                    default: namedProjectionsDefault,
                    custom: namedProjectionsCustom
                }[config],
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