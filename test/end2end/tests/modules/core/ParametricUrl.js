const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getUnnavigatedDriver, loadUrl} = require("../../../library/driver"),
    {getCenter, getResolution, isLayerVisible, areLayersOrdered, doesLayerWithFeaturesExist} = require("../../../library/scripts"),
    {centersTo, clickFeature, logTestingCloudUrlToTest} = require("../../../library/utils"),
    {isBasic, isCustom, isDefault, isMaster} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding masterportal query parameters.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ParameterTests ({builder, url, resolution, mode, capability}) {
    describe("URL Query Parameters", function () {
        let driver; // , gfi, counter;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                capability["sauce:options"].name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await getUnnavigatedDriver(builder, resolution);
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
                driver = await getUnnavigatedDriver(builder, resolution);
            }
        });

        it("?style=simple hides control elements", async function () {
            await loadUrl(driver, `${url}?style=simple`, mode);

            await driver.wait(until.elementIsNotVisible(driver.findElement(By.id("main-nav"))), 10000);
            expect(await driver.findElements(By.className("ol-viewport"))).to.not.be.empty;
            expect(await driver.findElements(By.className("mouse-position"))).to.be.empty;
            expect(await driver.findElements(By.className("top-controls"))).to.be.empty;
            expect(await driver.findElements(By.className("bottom-controls"))).to.be.empty;
        });

        it("?center= allows setting coordinates of map", async function () {
            await loadUrl(driver, `${url}?center=566499,5942803`, mode);
            await driver.wait(until.elementLocated(By.css(".navbar")), 10000);

            const center = await driver.executeScript(getCenter);

            expect([566499, 5942803]).to.eql(center);
        });

        if (isMaster(url)) {
            it("?zoomtogeometry=[number] zooms to a district", async function () {
                const expectedCoordinate = [556535.269, 5937846.413000001];

                // Bezirk 1 is Altona according to portal/master/config.js listing
                await loadUrl(driver, `${url}?zoomtogeometry=1`, mode);
                await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
                expect(await centersTo(driver, expectedCoordinate)).to.be.true;
            });

            it("?bezirk=[districtName] zooms to a district", async function () {
                const expectedCoordinate = [578867.787, 5924175.483999999];

                await loadUrl(driver, `${url}?zoomtogeometry=bergedorf`, mode);
                await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
                expect(await centersTo(driver, expectedCoordinate)).to.be.true;
            });
        }

        it("?layerids=, &visibility=, and &transparency= work together to display a layer in tree and map as configured", async function () {
            // 2426 is "Bezirke"
            await loadUrl(driver, `${url}?layerids=2426&visibility=true&transparency=0`, mode);
            await driver.wait(until.elementLocated(By.css(".navbar")), 10000);

            const treeEntry = await driver.findElement(
                    isBasic(url) || isMaster(url)
                        ? By.xpath("//ul[@id='tree']/li[.//span[@title='Bezirke'] and .//span[contains(@class,'glyphicon-check')]]")
                        : By.css("#SelectedLayer .layer-item [title=\"Bezirke\"]")
                ),
                visible = await driver.executeScript(isLayerVisible, "2426", "1");

            expect(treeEntry).to.exist;
            expect(visible).to.be.true;
        });

        it("?layerIDs=, &visibility=, and &transparency= allow configuring multiple layers and work with &center= and &zoomlevel=", async function () {
            let ortho = "";

            // 2426 is "Bezirke"
            // 452 is "Digitale Orthophotos (belaubt) Hamburg || Luftbilder DOP 20 (DOP 40 mit Umland)"
            await loadUrl(driver, `${url}?layerIDs=452,2426&visibility=true,true&transparency=40,20&center=560478.8,5937293.5&zoomlevel=3`, mode);
            await driver.wait(until.elementLocated(By.css(".navbar")), 10000);

            if (isBasic(url) || isMaster(url)) {
                ortho = "ul#tree li [title^=\"Digitale Orthophotos (belaubt) Hamburg\"]";
            }
            else if (isDefault(url)) {
                ortho = "#SelectedLayer .layer-item [title^=\"Luftbilder DOP 20 (DOP 40 mit Umland)\"]";
            }
            else {
                ortho = "#SelectedLayer .layer-item [title^=\"Digitale Orthophotos (belaubt) Hamburg\"]";
            }

            const treeEntryLuftbilder = await driver.findElement(By.css(ortho)),
                treeEntryBezirke = await driver.findElement(By.css(
                    isBasic(url) || isMaster(url)
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

        if (isMaster(url)) {
            it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - KiTa layer GFI with example 'KiTa Stadt-Land-Fluss' shows gfi", async function () {
                await loadUrl(driver, `${url}?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`, mode);
                // at coords '550115.420 5935760.220'
                let counter = 0;

                do {
                    expect(counter++).to.be.below(25);
                    await clickFeature(driver, [550115.420, 5935760.220]);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'KiTa Stadt-Land-Fluss')]")));
                await driver.actions({bridge: true})
                    .dragAndDrop(
                        await driver.findElement(By.css(".gfi .tool-window-vue .tool-window-heading .basic-drag-handle")),
                        await driver.findElement(By.css("html"))
                    )
                    .perform();
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);
            });

            it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - hospital layer GFI with example 'Krankenhaus Tabea' shows gfi", async function () {
                await loadUrl(driver, `${url}?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`, mode);
                // at coords '552406.014 5935396.345'
                let counter = 0;

                do {
                    expect(counter++).to.be.below(10);
                    await clickFeature(driver, [552406.014, 5935396.345]);
                    await driver.wait(new Promise(r => setTimeout(r, 1000)));
                } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Krankenhaus Tabea')]")));
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);
            });

            it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - both layers have their respective legend loaded", async function () {
                await loadUrl(driver, `${url}?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`, mode);
                await (await driver.findElement(By.id("legend-menu"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-window"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=KitaEinrichtungen')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_Krankenhaeuser?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=krankenhaeuser')]"))).to.exist;
                await (await driver.findElement(By.id("legend-menu"))).click();
                expect((await driver.findElements(By.css("div.legend-window"))).length).to.equal(0);
            });

            it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - layers are shown in the topic tree and present layer information", async function () {
                await loadUrl(driver, `${url}?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`, mode);
                await (await driver.findElement(By.css("div#navbarRow li:first-child"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tree"))));
                await (await driver.findElement(By.css(".layer:nth-child(4) .glyphicon-info-sign"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#layerinformation-desktop"))));

                expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
            });
            // });

            it("?layerIDs=, &visibility=, and &transparency= with set zoom level have working gfi/legend/info", async function () {
                await loadUrl(driver, `${url}?layerIDs=4736,4537&visibility=true,true&transparency=0,0&zoomLevel=6`, mode);
                const coords = [566688.25, 5934320.50];

                // test hospital layer GFI with example "Hamburg Hauptbahnhof" at coords "566688.25, 5934320.50"
                do {
                    await clickFeature(driver, coords);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//h6[contains(.,'Steintorwall 20')]"))).to.exist;
                await driver.actions({bridge: true})
                    .dragAndDrop(
                        await driver.findElement(By.css(".gfi .tool-window-vue .tool-window-heading .basic-drag-handle")),
                        await driver.findElement(By.css("html"))
                    )
                    .perform();
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);

                // check whether layer has its legend loaded
                await (await driver.findElement(By.id("legend-menu"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-window"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geoportal-hamburg.de/legende/legende_solar.png')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//span[contains(@class, 'glyphicon-remove')]"))).click();
                expect((await driver.findElements(By.css("div.legend-window"))).length).to.equal(0);

                // check layer information in topic tree
                await (await driver.findElement(By.css("div#navbarRow li:first-child"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tree"))));
                await (await driver.findElement(By.xpath("//ul[@id='tree']/li[.//span[@title='Eignungsflächen']]//span[contains(@class,'glyphicon-info-sign')]"))).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#layerinformation-desktop"))));

                expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
            });
        }

        if (isMaster(url) || isCustom(url)) {
            it("?featureid= displays markers for features", async function () {
                await loadUrl(driver, `${url}?featureid=18,26`, mode);
                await driver.wait(until.elementLocated(By.css(".navbar")), 10000);
                await driver.wait(async () => driver.executeScript(doesLayerWithFeaturesExist, [
                    {coordinate: [568814.3835, 5931819.377], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"},
                    {coordinate: [567043.565, 5934455.808], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"}
                ]), 20000);
            });
        }

        it("?zoomlevel= sets the chosen zoom level", async function () {
            await loadUrl(driver, `${url}?zoomlevel=8`, mode);

            expect(0.2645831904584105).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:1.000
        });

        it("?isinitopen= allows opening tools initially in window", async function () {
            const toolName = "fileimport",
                toolwindow = By.css(".tool-window-vue");

            await loadUrl(driver, `${url}?isinitopen=${toolName}`, mode);

            await driver.wait(until.elementLocated(toolwindow), 5000);

            expect(await driver.findElement(toolwindow)).to.exist;
        });

        it("?isinitopen= allows opening tools initially in sidebar", async function () {
            const toolName = "draw",
                toolSidebar = By.css("#tool-sidebar-vue");

            await loadUrl(driver, `${url}?isinitopen=${toolName}`, mode);

            await driver.wait(until.elementLocated(toolSidebar), 5000);

            expect(await driver.findElement(toolSidebar)).to.exist;
        });

        /**
         * Tests only in the default tree, because there only the gazetteer is configured.
         * With the BKG address service can not be tested, because this is only available in the fhhnet and therefore does not work on the Internet.
         */
        if (isDefault(url)) {
            it("?query= fills and executes query field", async function () {
                await loadUrl(driver, `${url}?query=Neuenfeld`, mode);

                await driver.wait(until.elementLocated(By.css("#searchInput")), 10000);
                const input = await driver.findElement(By.css("#searchInput"));

                // value is set to search field
                await driver.wait(async () => await input.getAttribute("value") === "Neuenfeld");

                // result list has entries, implying a search happened
                await driver.wait(until.elementLocated(By.css("#searchInputUL li")));
            });
        }

        /**
         * Tests only in the default tree, because there only the gazetteer is configured.
         * With the BKG address service can not be tested, because this is only available in the fhhnet and therefore does not work on the Internet.
         */
        if (isDefault(url)) {
            it("?query= fills and executes search and zooms to result if unique address", async function () {
                await loadUrl(driver, `${url}?query=Neuenfelder Straße,19`, mode);

                await driver.wait(until.elementLocated(By.css("#searchInput")), 10000);
                const input = await driver.findElement(By.css("#searchInput")),
                    expected = [566610.46394, 5928085.6];
                let center;

                // // value is set to search field
                await driver.wait(
                    async () => await input.getAttribute("value") === "Neuenfelder Straße 19",
                    10000,
                    "Query was not written so search input."
                );

                await driver.wait(async () => {
                    center = await driver.executeScript(getCenter);
                    return (
                        Math.abs(expected[0] - center[0]) < 0.1 &&
                        Math.abs(expected[1] - center[1]) < 0.1
                    );
                }, 10000, `Expected coordinates ${expected}, but received ${center}. Did not receive matching coordinates within 10 seconds.`);
            });
        }

        if (isMaster(url)) {
            it("?config= allows selecting a config", async function () {
                const splitUrl = url.split("_");
                let urlAffix = "";

                if (splitUrl.length > 1) {
                    splitUrl.shift();
                    urlAffix = `_${splitUrl.join("_")}`;
                }

                // test by redirecting master to default
                await loadUrl(driver, `${url}?config=../masterDefault${urlAffix}/config.json`, mode);

                expect(await driver.findElement(By.css("ul#tree .layer-catalog .header .form-inline .catalog-selection .form-control"))).to.exist;

                // test by redirecting master to custom
                await loadUrl(driver, `${url}?config=../masterCustom${urlAffix}/config.json`, mode);

                expect(await driver.findElement(By.css("ul#tree .layer-catalog .header .control-label"))).to.exist;
            });
        }

        if (isDefault(url)) {
            it("?mdid= opens and displays a layer", async function () {
                const topicSelector = By.css("div#navbarRow li:first-child");

                await loadUrl(driver, `${url}?mdid=EBA4BF12-3ED2-4305-9B67-8E689FE8C445`, mode);

                // check if active in tree
                await driver.wait(until.elementLocated(topicSelector));
                await (await driver.findElement(topicSelector)).click();
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tree"))));
                await driver.findElement(By.css("ul#SelectedLayer .layer-item:first-child span.glyphicon-check"));

                // check if visible in map
                await driver.executeScript(isLayerVisible, "1562_4");
            });
        }

        if (isDefault(url)) {
            it("opening and configuring lots of layers works", async function () {
                //  ?layerIDs=368,717,2423,1562_0,2432,1754,1757,1935geofox-bahn,2444,1561_6,2941,2452&visibility=true,false,false,false,false,false,false,false,false,false,false,false&transparency=0,0,0,0,0,0,0,0,0,0,0,0&center=572765.7219565103,5940389.380731404&zoomlevel=5
                let layers = "368,717,2423,1562_0,2432,1754,1757,1935geofox-bahn,2444,1561_6,2941,2452",
                    visibility = "true,false,false,false,false,false,false,false,false,false,false,false",
                    transparency = "0,0,0,0,0,0,0,0,0,0,0,0",
                    center = "572765.7219565103,5940389.380731404";

                await loadUrl(driver, `${url}?layerIDs=${layers}&visibility=${visibility}&transparency=${transparency}&center=${center}&zoomlevel=5`, mode);

                layers = layers.split(",");
                visibility = visibility.split(",");
                transparency = transparency.split(",");
                center = center.split(",");

                // layers are set in correct order
                expect(await driver.executeScript(areLayersOrdered, layers)).to.be.true;

                // layers have correct visibility/opacity
                for (let i = 0; i < layers.length; i++) {
                    expect(await driver.executeScript(isLayerVisible, layers[i], 1 - Number(transparency[i]))).to.equals(visibility[i] === "true");
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
