define(function (require) {
    var expect = require("chai").expect,
        Util = require("util"),
        ol = require("openlayers"),
        Style = require("../../../../modules/vectorStyle/model"),
        BuildSpecModel = require("../../../../../modules/tools/print_/buildSpec.js");

    describe("tools/print_/buildSpec", function () {
        var buildSpecModel,
            utilModel,
            pointFeatures,
            multiPointFeatures,
            lineStringFeatures,
            multiLineStringFeatures,
            polygonFeatures,
            multiPolygonFeatures,
            attr = {
                "layout": "A4 Hochformat",
                "outputFormat": "pdf",
                "attributes": {
                    "title": "TestTitel",
                    "map": {
                        "dpi": 96,
                        "projection": "EPSG:25832",
                        "center": [561210, 5932600],
                        "scale": 40000
                    }
                }
            };

        before(function () {
            buildSpecModel = new BuildSpecModel(attr);
            utilModel = new Util();
            pointFeatures = utilModel.createTestFeatures("resources/testFeatures.xml");
            multiPointFeatures = utilModel.createTestFeatures("resources/testFeaturesSpassAmWasserMultiPoint.xml");
            polygonFeatures = utilModel.createTestFeatures("resources/testFeaturesNaturschutzPolygon.xml");
            multiPolygonFeatures = utilModel.createTestFeatures("resources/testFeaturesBplanMultiPolygon.xml");
            lineStringFeatures = utilModel.createTestFeatures("resources/testFeaturesVerkehrsnetzLineString.xml");
            multiLineStringFeatures = utilModel.createTestFeatures("resources/testFeaturesVeloroutenMultiLineString.xml");
        });
        describe("parseAddress", function () {
            it("should return empty string if all keys in address object are empty", function () {
                var address = {
                    street: "",
                    housenr: "",
                    postalCode: "",
                    city: ""
                };

                expect(buildSpecModel.parseAddress(address)).to.be.a("string").that.is.empty;
            });
            it("should return empty address object is empty", function () {
                expect(buildSpecModel.parseAddress({})).to.be.a("string").that.is.empty;
            });
            it("should return empty address object is undefined", function () {
                expect(buildSpecModel.parseAddress(undefined)).to.be.a("string").that.is.empty;
            });
        });
        describe("isOwnMetaRequest", function () {
            it("should return true if uniqueId is in uniqueIdList", function () {
                expect(buildSpecModel.isOwnMetaRequest(["1234", "5678"], "1234")).to.be.true;
            });
            it("should return false if uniqueId is NOT in uniqueIdList", function () {
                expect(buildSpecModel.isOwnMetaRequest(["1234", "5678"], "91011")).to.be.false;
            });
            it("should return false if uniqueId is undefined", function () {
                expect(buildSpecModel.isOwnMetaRequest(["1234", "5678"], undefined)).to.be.false;
            });
            it("should return false if uniqueIdList is undefined", function () {
                expect(buildSpecModel.isOwnMetaRequest(undefined, "91011")).to.be.false;
            });
            it("should return false if uniqueIdList and uniqueId is undefined", function () {
                expect(buildSpecModel.isOwnMetaRequest(undefined, undefined)).to.be.false;
            });
        });
        describe("removeUniqueIdFromList", function () {
            it("should remove uniqueId from uniqueIdList if uniqueId in uniqueIdList", function () {
                buildSpecModel.removeUniqueIdFromList(["1234", "5678"], "1234");
                expect(buildSpecModel.get("uniqueIdList")).to.deep.equal(["5678"]);
            });
            it("should leave uniqueIdList if uniqueId not in uniqueIdList", function () {
                buildSpecModel.removeUniqueIdFromList(["1234", "5678"], "123456789");
                expect(buildSpecModel.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
            });
            it("should leave uniqueIdList if uniqueId is undefined", function () {
                buildSpecModel.removeUniqueIdFromList(["1234", "5678"], undefined);
                expect(buildSpecModel.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
            });
            it("should leave uniqueIdList if uniqueIdList is undefined", function () {
                buildSpecModel.removeUniqueIdFromList(undefined, "5678");
                expect(buildSpecModel.get("uniqueIdList")).to.be.an("array").that.is.empty;
            });
            it("should leave uniqueIdList if uniqueIdList and uniqueId is undefined", function () {
                buildSpecModel.removeUniqueIdFromList(undefined, undefined);
                expect(buildSpecModel.get("uniqueIdList")).to.be.an("array").that.is.empty;
            });
        });
        describe("updateMetaData", function () {
            it("should not crash if legend doesn't exist yet", function () {
                var parsedData = {
                    date: "",
                    orga: "",
                    address: {},
                    email: "",
                    tel: "",
                    url: ""
                };

                buildSpecModel.updateMetaData("testLayerName", parsedData);
                expect(buildSpecModel.get("attributes").legend).to.be.undefined;
            });
            it("should write parsedData to layer", function () {
                var parsedData = {
                        date: "1.1.2019",
                        orga: "LGV",
                        address: {},
                        email: "e@mail.de",
                        tel: "123456",
                        url: "www.url.de"
                    },
                    legend = {
                        "layers": [
                            {
                                "layerName": "testLayerName",
                                "values": []
                            }
                        ]
                    };

                buildSpecModel.get("attributes").legend = legend;
                buildSpecModel.updateMetaData("testLayerName", parsedData);

                expect(buildSpecModel.get("attributes").legend.layers[0]).to.own.include({
                    metaDate: "1.1.2019",
                    metaOwner: "LGV",
                    metaAddress: "",
                    metaEmail: "e@mail.de",
                    metaTel: "123456",
                    metaUrl: "www.url.de"
                });
            });
        });
        describe("prepareLegendAttributes", function () {
            it("should create legend attributes array for WMS", function () {
                var layerParam = {
                    layername: "Layer1",
                    legend: [{
                        img: ["http://GetlegendGraphicRequest1", "http://GetlegendGraphicRequest2"],
                        typ: "WMS"
                    }]
                };

                expect(buildSpecModel.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "wmsGetLegendGraphic",
                    geometryType: "",
                    imageUrl: "http://GetlegendGraphicRequest1",
                    color: "",
                    label: "Layer1"
                });
                expect(buildSpecModel.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
                    legendType: "wmsGetLegendGraphic",
                    geometryType: "",
                    imageUrl: "http://GetlegendGraphicRequest2",
                    color: "",
                    label: "Layer1"
                });
            });
            it("should create legend attributes array for WFS", function () {
                var layerParam = {
                    layername: "Layer1",
                    legend: [{
                        img: ["https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img/imgLink1.png", "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img/imgLink2.png"],
                        typ: "WFS"
                    }]
                };

                expect(buildSpecModel.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img/imgLink1.png",
                    color: "",
                    label: "Layer1"
                });
                expect(buildSpecModel.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img/imgLink2.png",
                    color: "",
                    label: "Layer1"
                });
            });
            it("should create legend attributes array for styleWMS", function () {
                var layerParam = {
                    legend: [{
                        params: [
                            {color: "#000000", startRange: "1", stopRange: "2"},
                            {color: "#ff0000", startRange: "3", stopRange: "4"},
                            {color: "#00ff00", startRange: "5", stopRange: "6"}],
                        typ: "styleWMS"
                    }]
                };

                expect(buildSpecModel.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "#000000",
                    label: "1 - 2"
                });
                expect(buildSpecModel.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "#ff0000",
                    label: "3 - 4"
                });
                expect(buildSpecModel.prepareLegendAttributes(layerParam)[2]).to.deep.own.include({
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "#00ff00",
                    label: "5 - 6"
                });
            });
        });
        describe("prepareGfiAttributes", function () {
            it("should create gfi attributes array", function () {
                var gfiAttributes = {
                    attr1: "value1",
                    attr2: "value2",
                    attr3: "value3"
                };

                expect(buildSpecModel.prepareGfiAttributes(gfiAttributes)[0]).to.deep.own.include({
                    key: "attr1",
                    value: "value1"
                });
                expect(buildSpecModel.prepareGfiAttributes(gfiAttributes)[1]).to.deep.own.include({
                    key: "attr2",
                    value: "value2"
                });
                expect(buildSpecModel.prepareGfiAttributes(gfiAttributes)[2]).to.deep.own.include({
                    key: "attr3",
                    value: "value3"
                });
            });
            it("should create empty gfi attributes array for empty attributes", function () {
                expect(buildSpecModel.prepareGfiAttributes({})).to.be.an("array").that.is.empty;
            });
            it("should create empty gfi attributes array for undefined attributes", function () {
                expect(buildSpecModel.prepareGfiAttributes({})).to.be.an("array").that.is.empty;
            });
        });
        describe("buildScale", function () {
            it("should create scale that is \"1:20000\" for number input", function () {
                buildSpecModel.buildScale(20000);
                expect(buildSpecModel.get("attributes").scale).to.deep.include("1:20000");
            });
            it("should create scale that is \"1:undefined\" for undefined input", function () {
                buildSpecModel.buildScale(undefined);
                expect(buildSpecModel.get("attributes").scale).to.deep.include("1:undefined");
            });

        });
        describe("addZero", function () {
            it("should create hex string part with leading 0 if input length === 1", function () {
                expect(buildSpecModel.addZero("A")).to.deep.include("0A");
            });
            it("should create hex string part without leading 0 if input length >1", function () {
                expect(buildSpecModel.addZero("ff")).to.deep.include("ff");
            });
        });
        describe("rgbArrayToHex", function () {
            it("should create hex string from rgbArray", function () {
                expect(buildSpecModel.rgbArrayToHex([255, 255, 255])).to.deep.include("#ffffff");
            });
            it("should create default hex string from empty rgbArray", function () {
                expect(buildSpecModel.rgbArrayToHex([])).to.deep.include("#000000");
            });
            it("should create default hex string from undefined rgbArray", function () {
                expect(buildSpecModel.rgbArrayToHex(undefined)).to.deep.include("#000000");
            });
            it("should create hex string from rgbArray with transparency", function () {
                expect(buildSpecModel.rgbArrayToHex([255, 0, 0, 1])).to.deep.include("#ff0000");
            });
        });
        describe("buildTileWms", function () {
            var tileWmsLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: "url",
                    params: {
                        LAYERS: "layer1,layer2",
                        FORMAT: "image/png"
                    }
                }),
                opacity: 1
            });

            it("should buildTileWms", function () {
                expect(buildSpecModel.buildTileWms(tileWmsLayer)).to.deep.own.include({
                    baseURL: "url",
                    opacity: 1,
                    type: "WMS",
                    layers: ["layer1", "layer2"],
                    imageFormat: "image/png",
                    customParams: {
                        TRANSPARENT: "true"
                    }
                });
            });
        });
        describe("buildImageWms", function () {
            var imageWmsLayer = new ol.layer.Tile({
                source: new ol.source.ImageWMS({
                    url: "url",
                    params: {
                        LAYERS: "layer1,layer2",
                        FORMAT: "image/png"
                    }
                }),
                opacity: 1
            });

            it("should buildImageWms", function () {
                expect(buildSpecModel.buildImageWms(imageWmsLayer)).to.deep.own.include({
                    baseURL: "url",
                    opacity: 1,
                    type: "WMS",
                    layers: ["layer1", "layer2"],
                    imageFormat: "image/png",
                    customParams: {
                        TRANSPARENT: "true"
                    }
                });
            });
        });
        describe("getStyleAttribute", function () {
            var vectorLayer = new ol.layer.Vector();

            it("should return \"styleId\" if styleList is not available", function () {
                expect(buildSpecModel.getStyleAttribute(vectorLayer)).to.equal("styleId");
            });
        });
        describe("getFeatureStyle", function () {
            var vectorLayer = new ol.layer.Vector();

            it("should return array with an ol-style", function () {
                expect(buildSpecModel.getFeatureStyle(pointFeatures[0], vectorLayer)).to.be.an("array");
                expect(buildSpecModel.getFeatureStyle(pointFeatures[0], vectorLayer)[0]).to.be.an.instanceof(ol.style.Style);
            });
        });
        describe("addFeatureToGeoJsonList", function () {
            var list = [];

            it("should return array with point JSON", function () {
                buildSpecModel.addFeatureToGeoJsonList(pointFeatures[0], list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include({
                    type: "Feature",
                    properties: {
                        anzahl_plaetze_teilstationaer: "43",
                        anzahl_planbetten: "252",
                        geburtsklinik_differenziert: "Nein",
                        hinweiszeile: undefined,
                        homepage: "http://www.evangelisches-krankenhaus-alsterdorf.de",
                        kh_nummer: "20",
                        krankenhausverzeichnis: "www.krankenhausverzeichnis.de|www.google.com|www.hamburg.de",
                        name: "Evangelisches Krankenhaus Alsterdorf",
                        ort: "22337  Hamburg",
                        stand: "01.01.2016",
                        strasse: "Bodelschwinghstraße 24",
                        teilnahme_geburtsklinik: "Nein",
                        teilnahme_notversorgung: "false"
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [567708.612, 5941076.513, 0]
                    }
                });
            });
            it("should return array with multiPoint JSON", function () {
                list = [];

                buildSpecModel.addFeatureToGeoJsonList(multiPointFeatures[0], list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include({
                    type: "Feature",
                    id: "APP_SPASS_IM_UND_AM_WASSER_1",
                    properties: {
                        nummer: "1",
                        name: "Ostender Teich - Sommerbad Ostende (Eintritt)",
                        kategorie: "Badeseen",
                        adresse: "Tonndorfer Strand 30, 22045 Hamburg",
                        link: "http://www.hamburg.de/sommerbad-ostende/",
                        kurztext: "Das Strandbad Ostende verfügt über einen Sandstrand und eine große Liegewiese mit Spielgeräten für Kinder"
                    },
                    geometry: {
                        type: "MultiPoint",
                        coordinates: [
                            [573983.957, 5938583.644, 0]
                        ]
                    }
                });
            });
            it("should return array with lineString JSON", function () {
                list = [];

                buildSpecModel.addFeatureToGeoJsonList(lineStringFeatures[0], list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include({
                    type: "Feature",
                    id: "APP_STRASSENNETZ_INSPIRE_BAB_6351",
                    properties: {
                        abs: "252500101 252500102",
                        abschnittslaenge: "469.0",
                        ast: "0",
                        europastrasse: "E 45",
                        gemeindeschluessel: undefined,
                        kreisschluessel: undefined,
                        laengenherkunft: undefined,
                        landesschluessel: "02",
                        strasse: "A 7",
                        strassenart: "A",
                        strassenname: "BAB A7",
                        strassennummer: "7"
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [561590.68, 5921144.34, 0],
                            [561644.084, 5921103.671, 0],
                            [561659.2, 5921092.16, 0],
                            [561716.088, 5921051.085, 0],
                            [561735.65, 5921036.96, 0],
                            [561842.988, 5920965.121, 0],
                            [561877.19, 5920942.23, 0],
                            [561979.23, 5920880.72, 0]
                        ]
                    }
                });
            });
            it("should return array with multiLineString JSON", function () {
                list = [];

                buildSpecModel.addFeatureToGeoJsonList(multiLineStringFeatures[0], list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include({
                    type: "Feature",
                    id: "Erster_Gruener_Ring.1",
                    properties: {
                        RoutenTyp: "Radfernwege",
                        Status: "Hauptroute",
                        Richtung: "Hin- und Rückweg",
                        RoutenName: "1. Grüner Ring",
                        Group_: "1. Grüner Ring_Hauptroute_Hinweg",
                        Routennummer: "0",
                        Verlauf: "\nLandungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken\n",
                        Routeninformation: "\nLandungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken\n"
                    },
                    geometry: {
                        type: "MultiLineString",
                        coordinates: [[
                            [5933240.612299999, 565065.9052999998, 0],
                            [5933242.200099999, 565024.3496000003, 0],
                            [5933243.6862, 564984.2522, 0],
                            [5933245.1719, 564955.2928999998, 0],
                            [5933239.976399999, 564871.3853000002, 0],
                            [5933232.553300001, 564780.0521999998, 0],
                            [5933229.584100001, 564741.4397, 0]
                        ]]
                    }
                });
            });
            it("should return array with polygon JSON", function () {
                list = [];

                buildSpecModel.addFeatureToGeoJsonList(polygonFeatures[0], list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include({
                    type: "Feature",
                    id: "APP_AUSGLEICHSFLAECHEN_333876",
                    properties: {
                        vorhaben: "W-006 - BPlan Marienthal 22 (Husarenweg)",
                        vorhaben_zulassung_am: "23.04.1996",
                        vorhaben_verfahrensart: "BPlan",
                        kompensationsmassnahme: "Grünfläche",
                        massnahmenstatus: "festgesetzt",
                        flaechensicherung: "k.A.",
                        flaeche: "6837.878000000001",
                        hektar: "0.6838000000000001",
                        kompensationsmassnahme_detail: "Bepflanzung mit Gehölzen und/oder Sträuchern",
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [[
                            [573169.734, 5935998.106, 0],
                            [573174.965, 5935999.887, 0],
                            [573179.967, 5936000.464, 0],
                            [573290.094, 5935931.609, 0],
                            [573299.702, 5935890.794, 0],
                            [573290.927, 5935888.812, 0],
                            [573251.047, 5935912.837, 0],
                            [573192.37, 5935919.986, 0],
                            [573194.244, 5935935.367, 0],
                            [573176.051, 5935952.246, 0],
                            [573147.404, 5935981.236, 0],
                            [573169.734, 5935998.106, 0]
                        ]]
                    }
                });
            });
            it("should return array with multiPolygon JSON", function () {
                list = [];

                buildSpecModel.addFeatureToGeoJsonList(multiPolygonFeatures[0], list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include({
                    type: "Feature",
                    id: "APP_PROSIN_FESTGESTELLT_1",
                    properties: {
                        aenderung1: undefined,
                        aenderung2: undefined,
                        aenderung3: undefined,
                        feststellung: "11.11.1969",
                        gop: undefined,
                        goplink: undefined,
                        hotlink: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan/Bahrenfeld18.pdf                                                                                                                                                                 ",
                        hotlink_begr: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan_begr/Bahrenfeld18.pdf                                                                                                                                                            ",
                        nachricht: undefined,
                        name_png: "Bahrenfeld18.png",
                        planjahr_m: "1969",
                        planrecht: "Bahrenfeld18                                                                                                                                                                                                                                                   ",
                        staedtebaulichervertrag: undefined
                    },
                    geometry: {
                        type: "MultiPolygon",
                        coordinates: [[[
                            [560717.814, 5936195.048, 0],
                            [560904.504, 5936154.977, 0],
                            [560987.031, 5936160.915, 0],
                            [561110.273, 5936169.785, 0],
                            [561125.876, 5936177.985, 0],
                            [561145.448, 5936138.313, 0],
                            [561186.978, 5936014.535, 0],
                            [561204.961, 5935958.995, 0],
                            [561223.729, 5935885.048, 0],
                            [561239.877, 5935821.734, 0],
                            [561086.214, 5935819.353, 0],
                            [561062.173, 5935818.616, 0],
                            [560960.89, 5935815.511, 0],
                            [560876.868, 5935811.999, 0],
                            [560865.675, 5935811.531, 0],
                            [560862.37, 5935822.577, 0],
                            [560859.9, 5935832.94, 0],
                            [560847.669, 5935884.252, 0],
                            [560843.601, 5935901.318, 0],
                            [560840.342, 5935914.697, 0],
                            [560824.457, 5935979.913, 0],
                            [560804.971, 5936059.458, 0],
                            [560787.478, 5936062.022, 0],
                            [560786.155, 5936062.216, 0],
                            [560742.375, 5936069.167, 0],
                            [560724.241, 5936122.096, 0],
                            [560719.891, 5936136.876, 0],
                            [560718.946, 5936139.051, 0],
                            [560717.814, 5936195.048, 0]
                        ]]]
                    }
                });
            });
        });
        describe("convertFeatureToGeoJson", function () {
            it("should convert point feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(pointFeatures[0])).to.deep.own.include({
                    type: "Feature",
                    properties: {
                        anzahl_plaetze_teilstationaer: "43",
                        anzahl_planbetten: "252",
                        geburtsklinik_differenziert: "Nein",
                        hinweiszeile: undefined,
                        homepage: "http://www.evangelisches-krankenhaus-alsterdorf.de",
                        kh_nummer: "20",
                        krankenhausverzeichnis: "www.krankenhausverzeichnis.de|www.google.com|www.hamburg.de",
                        name: "Evangelisches Krankenhaus Alsterdorf",
                        ort: "22337  Hamburg",
                        stand: "01.01.2016",
                        strasse: "Bodelschwinghstraße 24",
                        teilnahme_geburtsklinik: "Nein",
                        teilnahme_notversorgung: "false"
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [567708.612, 5941076.513, 0]
                    }
                });
            });
            it("should convert multiPoint feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(multiPointFeatures[0])).to.deep.own.include({
                    type: "Feature",
                    id: "APP_SPASS_IM_UND_AM_WASSER_1",
                    properties: {
                        nummer: "1",
                        name: "Ostender Teich - Sommerbad Ostende (Eintritt)",
                        kategorie: "Badeseen",
                        adresse: "Tonndorfer Strand 30, 22045 Hamburg",
                        link: "http://www.hamburg.de/sommerbad-ostende/",
                        kurztext: "Das Strandbad Ostende verfügt über einen Sandstrand und eine große Liegewiese mit Spielgeräten für Kinder"
                    },
                    geometry: {
                        type: "MultiPoint",
                        coordinates: [
                            [573983.957, 5938583.644, 0]
                        ]
                    }
                });
            });
            it("should convert lineString feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(lineStringFeatures[0])).to.deep.own.include({
                    type: "Feature",
                    id: "APP_STRASSENNETZ_INSPIRE_BAB_6351",
                    properties: {
                        abs: "252500101 252500102",
                        abschnittslaenge: "469.0",
                        ast: "0",
                        europastrasse: "E 45",
                        gemeindeschluessel: undefined,
                        kreisschluessel: undefined,
                        laengenherkunft: undefined,
                        landesschluessel: "02",
                        strasse: "A 7",
                        strassenart: "A",
                        strassenname: "BAB A7",
                        strassennummer: "7"
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [561590.68, 5921144.34, 0],
                            [561644.084, 5921103.671, 0],
                            [561659.2, 5921092.16, 0],
                            [561716.088, 5921051.085, 0],
                            [561735.65, 5921036.96, 0],
                            [561842.988, 5920965.121, 0],
                            [561877.19, 5920942.23, 0],
                            [561979.23, 5920880.72, 0]
                        ]
                    }
                });
            });
            it("should convert multiLineString feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(multiLineStringFeatures[0])).to.deep.own.include({
                    type: "Feature",
                    id: "Erster_Gruener_Ring.1",
                    properties: {
                        RoutenTyp: "Radfernwege",
                        Status: "Hauptroute",
                        Richtung: "Hin- und Rückweg",
                        RoutenName: "1. Grüner Ring",
                        Group_: "1. Grüner Ring_Hauptroute_Hinweg",
                        Routennummer: "0",
                        Verlauf: "\nLandungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken\n",
                        Routeninformation: "\nLandungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken\n"
                    },
                    geometry: {
                        type: "MultiLineString",
                        coordinates: [[
                            [5933240.612299999, 565065.9052999998, 0],
                            [5933242.200099999, 565024.3496000003, 0],
                            [5933243.6862, 564984.2522, 0],
                            [5933245.1719, 564955.2928999998, 0],
                            [5933239.976399999, 564871.3853000002, 0],
                            [5933232.553300001, 564780.0521999998, 0],
                            [5933229.584100001, 564741.4397, 0]
                        ]]
                    }
                });
            });
            it("should convert polygon feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(polygonFeatures[0])).to.deep.own.include({
                    type: "Feature",
                    id: "APP_AUSGLEICHSFLAECHEN_333876",
                    properties: {
                        vorhaben: "W-006 - BPlan Marienthal 22 (Husarenweg)",
                        vorhaben_zulassung_am: "23.04.1996",
                        vorhaben_verfahrensart: "BPlan",
                        kompensationsmassnahme: "Grünfläche",
                        massnahmenstatus: "festgesetzt",
                        flaechensicherung: "k.A.",
                        flaeche: "6837.878000000001",
                        hektar: "0.6838000000000001",
                        kompensationsmassnahme_detail: "Bepflanzung mit Gehölzen und/oder Sträuchern"
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [[
                            [573169.734, 5935998.106, 0],
                            [573174.965, 5935999.887, 0],
                            [573179.967, 5936000.464, 0],
                            [573290.094, 5935931.609, 0],
                            [573299.702, 5935890.794, 0],
                            [573290.927, 5935888.812, 0],
                            [573251.047, 5935912.837, 0],
                            [573192.37, 5935919.986, 0],
                            [573194.244, 5935935.367, 0],
                            [573176.051, 5935952.246, 0],
                            [573147.404, 5935981.236, 0],
                            [573169.734, 5935998.106, 0]
                        ]]
                    }
                });
            });
            it("should convert multiPolygon feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(multiPolygonFeatures[0])).to.deep.own.include({
                    type: "Feature",
                    id: "APP_PROSIN_FESTGESTELLT_1",
                    properties: {
                        aenderung1: undefined,
                        aenderung2: undefined,
                        aenderung3: undefined,
                        feststellung: "11.11.1969",
                        gop: undefined,
                        goplink: undefined,
                        hotlink: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan/Bahrenfeld18.pdf                                                                                                                                                                 ",
                        hotlink_begr: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan_begr/Bahrenfeld18.pdf                                                                                                                                                            ",
                        nachricht: undefined,
                        name_png: "Bahrenfeld18.png",
                        planjahr_m: "1969",
                        planrecht: "Bahrenfeld18                                                                                                                                                                                                                                                   ",
                        staedtebaulichervertrag: undefined
                    },
                    geometry: {
                        type: "MultiPolygon",
                        coordinates: [[[
                            [560717.814, 5936195.048, 0],
                            [560904.504, 5936154.977, 0],
                            [560987.031, 5936160.915, 0],
                            [561110.273, 5936169.785, 0],
                            [561125.876, 5936177.985, 0],
                            [561145.448, 5936138.313, 0],
                            [561186.978, 5936014.535, 0],
                            [561204.961, 5935958.995, 0],
                            [561223.729, 5935885.048, 0],
                            [561239.877, 5935821.734, 0],
                            [561086.214, 5935819.353, 0],
                            [561062.173, 5935818.616, 0],
                            [560960.89, 5935815.511, 0],
                            [560876.868, 5935811.999, 0],
                            [560865.675, 5935811.531, 0],
                            [560862.37, 5935822.577, 0],
                            [560859.9, 5935832.94, 0],
                            [560847.669, 5935884.252, 0],
                            [560843.601, 5935901.318, 0],
                            [560840.342, 5935914.697, 0],
                            [560824.457, 5935979.913, 0],
                            [560804.971, 5936059.458, 0],
                            [560787.478, 5936062.022, 0],
                            [560786.155, 5936062.216, 0],
                            [560742.375, 5936069.167, 0],
                            [560724.241, 5936122.096, 0],
                            [560719.891, 5936136.876, 0],
                            [560718.946, 5936139.051, 0],
                            [560717.814, 5936195.048, 0]
                        ]]]
                    }
                });
            });
        });
        describe("getStylingRule", function () {
            var vectorLayer = new ol.layer.Vector();

            it("should return \"*\" if styleAttribute is empty string", function () {
                expect(buildSpecModel.getStylingRule(vectorLayer, pointFeatures[0], "")).to.equal("*");
            });
            it("should return \"[styleId='undefined']\" if styleAttribute is \"styleId\"", function () {
                expect(buildSpecModel.getStylingRule(vectorLayer, pointFeatures[0], "styleId")).to.equal("[styleId='undefined']");
            });
            it("should return \"[kh_nummer='20']\" if styleAttribute is \"kh_nummer\"", function () {
                expect(buildSpecModel.getStylingRule(vectorLayer, pointFeatures[0], "kh_nummer")).to.equal("[kh_nummer='20']");
            });
        });
        describe("buildPointStyleCircle", function () {
            it("should convert circleStyle into style object for print", function () {
                var circleStyleModel = new Style({
                        layerId: "1711",
                        class: "POINT",
                        subClass: "CIRCLE",
                        circleRadius: 20,
                        circleFillColor: [255, 0, 0, 1],
                        circleStrokeColor: [0, 0, 255, 1],
                        circleStrokeWidth: 5
                    }),
                    vectorLayer = new ol.layer.Vector({
                        style: function (feature) {
                            return circleStyleModel.createStyle(feature, false);
                        }
                    }),
                    style = buildSpecModel.getFeatureStyle(pointFeatures[0], vectorLayer)[0];

                expect(buildSpecModel.buildPointStyleCircle(style.getImage())).to.deep.own.include({
                    fillColor: "#ff0000",
                    fillOpacity: 1,
                    pointRadius: 20,
                    strokeColor: "#0000ff",
                    strokeOpacity: 1,
                    strokeWidth: 5,
                    type: "point"
                });
            });

        });
        describe("buildPointStyleIcon", function () {
            it("should convert iconStyle into style object for print", function () {
                var iconStyleModel = new Style({
                        layerId: "1711",
                        class: "POINT",
                        subClass: "SIMPLE",
                        clusterImageName: "krankenhaus.png",
                        imageName: "krankenhaus.png",
                        imageScale: "0.7"
                    }),
                    vectorLayer = new ol.layer.Vector({
                        style: function (feature) {
                            return iconStyleModel.createStyle(feature, false);
                        }
                    }),
                    style = buildSpecModel.getFeatureStyle(pointFeatures[0], vectorLayer)[0];

                expect(buildSpecModel.buildPointStyleIcon(style.getImage(), vectorLayer)).to.deep.own.include({
                    externalGraphic: "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img/krankenhaus.png",
                    graphicHeight: NaN, // image kann im test nicht gefunden werden, daher kann size nicht berechnet werden
                    graphicWidth: NaN,
                    type: "point"
                });
            });
        });
        describe("buildPolygonStyle", function () {
            it("should convert polygonStyle into style object for print", function () {
                var polygonStyleModel = new Style({
                        class: "POLYGON",
                        subClass: "SIMPLE",
                        polygonFillColor: [189, 189, 0, 1],
                        polygonStrokeColor: [98, 98, 0, 1],
                        polygonStrokeWidth: 2
                    }),
                    vectorLayer = new ol.layer.Vector({
                        style: function (feature) {
                            return polygonStyleModel.createStyle(feature, false);
                        }
                    }),
                    style = buildSpecModel.getFeatureStyle(polygonFeatures[0], vectorLayer)[0];

                expect(buildSpecModel.buildPolygonStyle(style, vectorLayer)).to.deep.own.include({
                    fillColor: "#bdbd00",
                    fillOpacity: 1,
                    strokeColor: "#626200",
                    strokeOpacity: 1,
                    strokeWidth: 2,
                    type: "polygon"
                });
            });
        });
        describe("buildLineStringStyle", function () {
            it("should convert lineStringStyle into style object for print", function () {
                var lineStyleModel = new Style({
                        class: "Line",
                        subClass: "SIMPLE",
                        lineStrokeColor: [51, 153, 0, 1],
                        lineStrokeWidth: 3
                    }),
                    vectorLayer = new ol.layer.Vector({
                        style: function (feature) {
                            return lineStyleModel.createStyle(feature, false);
                        }
                    }),
                    style = buildSpecModel.getFeatureStyle(lineStringFeatures[0], vectorLayer)[0];

                expect(buildSpecModel.buildLineStringStyle(style, vectorLayer)).to.deep.own.include({
                    strokeColor: "#339900",
                    strokeOpacity: 1,
                    strokeWidth: 3,
                    type: "line"
                });
            });
        });
        describe("getImageName", function () {
            it("should return everything behind last \"/\" inclusive", function () {
                var iconStyleModel = new Style({
                        layerId: "1711",
                        class: "POINT",
                        subClass: "SIMPLE",
                        clusterImageName: "krankenhaus.png",
                        imageName: "krankenhaus.png",
                        imageScale: "0.7"
                    }),
                    vectorLayer = new ol.layer.Vector({
                        style: function (feature) {
                            return iconStyleModel.createStyle(feature, false);
                        }
                    }),
                    style = buildSpecModel.getFeatureStyle(pointFeatures[0], vectorLayer)[0];

                expect(buildSpecModel.getImageName(style.getImage().getSrc())).to.equal("/krankenhaus.png");
            });
        });
    });
});
