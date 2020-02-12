const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {getCenter, getResolution, isLayerVisible, areLayersOrdered, doesLayerWithFeaturesExist, setCenter} = require("../../../library/scripts"),
    {centersTo} = require("../../../library/utils"),
    {isBasic, isCustom, isDefault} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding masterportal query parameters.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ParameterTests ({builder, url, resolution}) {
    describe("URL Query Parameters", function () {
        let driver;

        afterEach(async function () {
            await driver.quit();
        });

        it("?style=simple hides control elements", async function () {
            driver = await initDriver(builder, `${url}?style=simple`, resolution);

            await driver.wait(until.elementIsNotVisible(driver.findElement(By.id("main-nav"))), 10000);
            expect(await driver.findElements(By.className("ol-viewport"))).to.not.be.empty;
            expect(await driver.findElements(By.className("mousePosition"))).to.be.empty;
            expect(await driver.findElements(By.className("controls-view"))).to.be.empty;
            expect(await driver.findElements(By.className("control-view-bottom-right"))).to.be.empty;
        });

        it("?center= allows setting coordinates of map", async function () {
            driver = await initDriver(builder, `${url}?center=566499,5942803`, resolution);

            const center = await driver.executeScript(getCenter);

            expect([566499, 5942803]).to.eql(center);
        });

        it("?bezirk=[number] zooms to a district", async function () {
            const expectedCoordinate = [556535.269, 5937846.413000001];

            // Bezirk 2 is Altona
            driver = await initDriver(builder, `${url}?bezirk=2`, resolution);
            expect(await centersTo(driver, expectedCoordinate)).to.be.true;
        });

        it("?bezirk=[districtName] zooms to a district", async function () {
            const expectedCoordinate = [578867.787, 5924175.483999999];

            driver = await initDriver(builder, `${url}?bezirk=bergedorf`, resolution);
            expect(await centersTo(driver, expectedCoordinate)).to.be.true;
        });

        it("?layerids=, &visibility=, and &transparency= work together to display a layer in tree and map as configured", async function () {
            // 2426 is "Bezirke"
            driver = await initDriver(builder, `${url}?layerids=2426&visibility=true&transparency=0`, resolution);

            const treeEntry = await driver.findElement(By.css(
                    isBasic(url)
                        ? "ul#tree li:first-child .glyphicon-check"
                        : "#SelectedLayer .layer-item [title=\"Bezirke\"]"
                )),
                visible = await driver.executeScript(isLayerVisible, "2426", "1");

            expect(treeEntry).to.exist;
            expect(visible).to.be.true;
        });

        it("?layerIDs=, &visibility=, and &transparency= allow configuring multiple layers and work with &center= and &zoomlevel=", async function () {
            // 2426 is "Bezirke"
            // 452 is "Luftbilder DOP 20 (belaubt)"
            driver = await initDriver(builder, `${url}?layerIDs=452,2426&visibility=true,true&transparency=40,20&center=560478.8,5937293.5&zoomlevel=3`, resolution);

            const treeEntryLuftbilder = await driver.findElement(By.css(
                    isBasic(url)
                        ? "ul#tree li [title^=\"Luftbilder\"]"
                        : "#SelectedLayer .layer-item [title^=\"Luftbilder\"]"
                )),
                treeEntryBezirke = await driver.findElement(By.css(
                    isBasic(url)
                        ? "ul#tree li [title=\"Bezirke\"]"
                        : "#SelectedLayer .layer-item [title=\"Bezirke\"]"
                )),
                luftbilderVisible = await driver.executeScript(isLayerVisible, "452", "0.6"),
                bezirkeVisible = await driver.executeScript(isLayerVisible, "2426", "0.8");

            expect(treeEntryLuftbilder).to.exist;
            expect(treeEntryBezirke).to.exist;
            expect(luftbilderVisible).to.equal(true);
            expect(bezirkeVisible).to.equal(true);
            expect(await driver.executeScript(areLayersOrdered, ["452", "2426"])).to.be.true;
            expect([560478.8, 5937293.5]).to.eql(await driver.executeScript(getCenter));
            expect(10.58332761833642).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:40.000
        });

        if (isBasic(url)) {
            it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info", async function () {
                driver = await initDriver(builder, `${url}?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`, resolution);
                const viewport = await driver.findElement(By.css(".ol-viewport"));

                // test KiTa layer GFI with example "KiTa Stadt-Land-Fluss" at coords "550103.5102357711, 5935760.012742457"
                await driver.executeScript(setCenter, [550103.5102357711, 5935760.012742457]);
                await driver.actions({bridge: true})
                    .move({origin: viewport})
                    .click()
                    .perform();

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'KiTa Stadt-Land-Fluss')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("div.gfi"))));

                // test hospital layer GFI with example "Krankenhaus Tabea" at coords "552304.1809224088, 5935345.322637472"
                await driver.executeScript(setCenter, [552304.1809224088, 5935345.322637472]);
                await driver.actions({bridge: true})
                    .move({origin: viewport})
                    .click()
                    .perform();

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Krankenhaus Tabea')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("div.gfi"))));

                // check whether both layers have their respective legend loaded
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Legende')]"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-win"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-win')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=KitaEinrichtungen')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-win')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_Krankenhaeuser?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=krankenhaeuser')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Legende')]"))).click();
                await (await driver.findElement(By.xpath("//div[contains(@class,'legend-win')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("div.legend-win"))));

                // check layer information in topic tree
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Themen')]"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tree"))));
                await (await driver.findElement(By.css(".layer:nth-child(4) .glyphicon-info-sign"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#layerinformation-desktop"))));
                /* NOTE: This test fails since the text indicates an error occured.
                 * Is the info text static? If so, this line should be changed to check for the presence of the actually desired content.
                 *                          If not, does this criterium suffice?
                 */
                expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
            });
        }

        if (isDefault(url)) {
            it("?layerIDs=, &visibility=, and &transparency= with set zoom level have working gfi/legend/info", async function () {
                driver = await initDriver(builder, `${url}?layerIDs=4736,4537&visibility=true,true&transparency=0,0&zoomLevel=6`, resolution);
                const viewport = await driver.findElement(By.css(".ol-viewport"));

                // test hospital layer GFI with example "Hamburg Hauptbahnhof" at coords "566703.4596051318, 5934257.665292527"
                await driver.executeScript(setCenter, [566703.4596051318, 5934257.665292527]);
                await driver.actions({bridge: true})
                    .move({origin: viewport})
                    .click()
                    .perform();

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Steintorwall 20')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("div.gfi"))));

                // check whether layer has its legend loaded
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Legende')]"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-win"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-win')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_Solaratlas?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=geb_sum')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Legende')]"))).click();
                await (await driver.findElement(By.xpath("//div[contains(@class,'legend-win')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("div.legend-win"))));

                // check layer information in topic tree
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Themen')]"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tree"))));
                await (await driver.findElement(By.xpath("//ul[@id='SelectedLayer']/li/span[2]/span"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#layerinformation-desktop"))));
                /* NOTE: This test fails since the text indicates an error occured.
                 * Is the info text static? If so, this line should be changed to check for the presence of the actually desired content.
                 *                          If not, does this criterium suffice?
                 */
                expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
            });
        }

        if (isCustom(url)) {
            it("?featureid= displays markers for features", async function () {
                driver = await initDriver(builder, `${url}?featureid=18,26`, resolution);
                await driver.wait(async () => driver.executeScript(doesLayerWithFeaturesExist, [
                    {coordinate: [568814.3835, 5931819.377], image: "https://geoportal-hamburg.de/lgv-config/img/location_eventlotse.svg"},
                    {coordinate: [567043.565, 5934455.808], image: "https://geoportal-hamburg.de/lgv-config/img/location_eventlotse.svg"}
                ]), 5000);
            });
        }

        it("?zoomlevel= sets the chosen zoom level", async function () {
            driver = await initDriver(builder, `${url}?zoomlevel=8`, resolution);

            expect(0.2645831904584105).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:1.000
        });

        if (isCustom(url)) {
            it("?startupmodul= allows opening tools initially", async function () {
                driver = await initDriver(builder, `${url}?startupmodul=routing`, resolution);

                const selector = "//div[contains(@id,'window')]//span[contains(.,'Routenplaner')]";

                await driver.wait(until.elementLocated(By.xpath(selector)), 10000);

                expect(await driver.findElement(By.xpath(selector))).to.exist;
            });
        }

        if (!isBasic(url)) {
            it("?query= fills and executes query field", async function () {
                driver = await initDriver(builder, `${url}?query=Neuenfeld`, resolution);

                await driver.wait(until.elementLocated(By.css("#searchInput")), 10000);
                const input = await driver.findElement(By.css("#searchInput"));

                // value is set to search field
                await driver.wait(async () => await input.getAttribute("value") === "Neuenfeld");

                // result list has entries, implying a search happened
                await driver.wait(until.elementLocated(By.css("#searchInputUL li")));
            });
        }

        if (isDefault(url)) {
            it("?query= fills and executes search and zooms to result if unique address", async function () {
                driver = await initDriver(builder, `${url}?query=Neuenfelder Straße,19, 21109`, resolution);

                await driver.wait(until.elementLocated(By.css("#searchInput")), 10000);
                const input = await driver.findElement(By.css("#searchInput")),
                    expected = [566610.46394, 5928085.6];
                let center;

                // value is set to search field
                await driver.wait(async () => await input.getAttribute("value") === "Neuenfelder Straße,19, 21109");

                await driver.wait(async () => {
                    center = await driver.executeScript(getCenter);
                    return (
                        Math.abs(expected[0] - center[0]) < 0.1 &&
                        Math.abs(expected[1] - center[1]) < 0.1
                    );
                }, 10000, `Expected coordinates ${expected}, but received ${center}. Did not receive matching coordinates within 10 seconds.`);
            });
        }

        if (isCustom(url)) {
            it("?config= allows selecting a config", async function () {
                driver = await initDriver(builder, `${url}?config=../basic/config.json`, resolution);
                // icon varies between basic and custom - use as indicator that switching config worked
                await driver.wait(until.elementLocated(By.css(".dropdown:nth-child(1) > .dropdown-toggle > .glyphicon-folder-open")));
            });
        }

        if (isDefault(url)) {
            it("?mdid= opens and displays a layer", async function () {
                driver = await initDriver(builder, `${url}?mdid=EBA4BF12-3ED2-4305-9B67-8E689FE8C445`, resolution);

                // check if active in tree
                await (await driver.findElement(By.xpath("//div[@id='navbarRow']//a[contains(.,'Themen')]"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tree"))));
                await driver.findElement(By.css("ul#SelectedLayer .layer-item:first-child span.glyphicon-check"));

                // check if visible in map
                await driver.executeScript(isLayerVisible, "1562_4");
            });
        }

        if (isDefault(url)) {
            it.skip("opening and configuring lots of layers works", async function () {
                /* TODO
                6.16. (DT, nur FHH-Atlas) Portal mit dem Parameter ?layerIDs=368,8,717,2428,2423,1562_0,2432,1754,1757,1172,1935geofox-bahn,2676,2444,1561_6,2941,2452&visibility=true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false&transparency=0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0&center=572765.7219565103,5940389.380731404&zoomlevel=5 aufrufen (2,5h)
                    -> Es werden diverse Layer angezeigt NOTE nur einer wegen überwiegend visibility false
                    -> Es wird kein Fehler oder Alert angezeigt NOTE einige Fehler/Alerts - falsche Datenquelle? (DT)
                    -> Transparenz und Sichtbarkeit der Layer stimmen mit dem Aufruf überein NOTE ist im Test

                NOTE nach Rücksprache in MPLGV-96 erstmal auf ".skip" gestellt, bis eine öffentliche Konfiguration hierfür kommt
                */
                let layers = "368,8,717,2428,2423,1562_0,2432,1754,1757,1172,1935geofox-bahn,2676,2444,1561_6,2941,2452",
                    visibility = "true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false",
                    transparency = "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
                    center = "572765.7219565103,5940389.380731404";

                driver = await initDriver(builder, `${url}?layerIDs=${layers}&visibility=${visibility}&transparency=${transparency}&center=${center}&zoomlevel=5`, resolution);

                layers = layers.split(",");
                visibility = visibility.split(",");
                transparency = transparency.split(",");
                center = center.split(",");

                // layers are set in correct order
                expect(await driver.executeScript(areLayersOrdered, layers)).to.be.true;

                // layers have correct visibility/opacity
                for (let i = 0; i < layers.length; i++) {
                    expect(await driver.executeScript(isLayerVisible, layers[i], 1 - Number(transparency[i]))).to.be(visibility[i] === "true");
                }

                // center parameter worked
                expect(center.map(Number)).to.eql(await driver.executeScript(getCenter));

                // zoom parameter worked
                expect(2.6458319045841048).to.equal(await driver.executeScript(getResolution)); // equals 1:10.000

                // no alert present
                expect(await driver.findElements(By.css("#messages .alert"))).to.be.empty;
            });
        }
    });
}

module.exports = ParameterTests;
