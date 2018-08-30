define(function (require) {
    var expect = require("chai").expect,
        Util = require("util"),
        ol = require("openlayers"),
        Style = require("../../../../modules/vectorStyle/model"),
        BuildSpecModel = require("../../../../../modules/tools/print_/buildSpec.js");

    describe("tools/print_/buildSpec", function () {
        var buildSpecModel,
            utilModel,
            features,
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
            features = utilModel.createTestFeatures("resources/testFeatures.xml");
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
                    img: ["http://GetlegendGraphicRequest1", "http://GetlegendGraphicRequest2"],
                    legendname: ["Layer1", "Layer2"],
                    typ: "WMS"
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
                    label: "Layer2"
                });
            });
            it("should create legend attributes array for WFS", function () {
                var layerParam = {
                    img: ["http://imgLink1", "http://imgLink2"],
                    legendname: ["Layer1", "Layer2"],
                    typ: "WFS"
                };

                expect(buildSpecModel.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "http://imgLink1",
                    color: "",
                    label: "Layer1"
                });
                expect(buildSpecModel.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "http://imgLink2",
                    color: "",
                    label: "Layer2"
                });
            });
            it("should create legend attributes array for styleWMS", function () {
                var layerParam = {
                    params: [
                        {color: "#000000", startRange: "1", stopRange: "2"},
                        {color: "#ff0000", startRange: "3", stopRange: "4"},
                        {color: "#00ff00", startRange: "5", stopRange: "6"}],
                    typ: "styleWMS"
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
                expect(buildSpecModel.getFeatureStyle(features[0], vectorLayer)).to.be.an("array");
                expect(buildSpecModel.getFeatureStyle(features[0], vectorLayer)[0]).to.be.an.instanceof(ol.style.Style);
            });
        });
        describe("addFeatureToGeoJsonList", function () {
            var list = [];

            it("should return array with point JSON", function () {
                buildSpecModel.addFeatureToGeoJsonList(features[0], list);
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
            it("TODO:should return array with multipoint JSON", function () {
                var multipoint;

                buildSpecModel.addFeatureToGeoJsonList(multipoint, list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include();
            });
            it("TODO:should return array with linestring JSON", function () {
                var linestring;

                buildSpecModel.addFeatureToGeoJsonList(linestring, list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include();
            });
            it("TODO:should return array with polygon JSON", function () {
                var polygon;

                buildSpecModel.addFeatureToGeoJsonList(polygon, list);
                expect(list).to.be.an("array");
                expect(list[0]).to.deep.own.include();
            });
        });
        describe("convertFeatureToGeoJson", function () {
            it("should convert point feature to JSON", function () {
                expect(buildSpecModel.convertFeatureToGeoJson(features[0])).to.deep.own.include({
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
            it("TODO:should convert multipoint feature to JSON", function () {
                var multipoint;

                expect(buildSpecModel.convertFeatureToGeoJson(multipoint)).to.deep.own.include();
            });
            it("TODO:should convert linestring feature to JSON", function () {
                var linestring;

                expect(buildSpecModel.convertFeatureToGeoJson(linestring)).to.deep.own.include();
            });
            it("TODO:should convert polygon feature to JSON", function () {
                var polygon;

                expect(buildSpecModel.convertFeatureToGeoJson(polygon)).to.deep.own.include();
            });
        });
        describe("getStylingRule", function () {
            it("should return \"*\" if styleAttribute is empty string", function () {
                expect(buildSpecModel.getStylingRule(features[0], "")).to.equal("*");
            });
            it("should return \"[styleId='undefined']\" if styleAttribute is \"styleId\"", function () {
                expect(buildSpecModel.getStylingRule(features[0], "styleId")).to.equal("[styleId='undefined']");
            });
            it("should return \"[kh_nummer='20']\" if styleAttribute is \"kh_nummer\"", function () {
                expect(buildSpecModel.getStylingRule(features[0], "kh_nummer")).to.equal("[kh_nummer='20']");
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
                    style = buildSpecModel.getFeatureStyle(features[0], vectorLayer)[0];

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
                    style = buildSpecModel.getFeatureStyle(features[0], vectorLayer)[0];

                expect(buildSpecModel.buildPointStyleIcon(style.getImage())).to.deep.own.include({
                    externalGraphic: "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img/krankenhaus.png",
                    graphicHeight: NaN, // image kann im test nicht gefunden werden, daher kann size nicht berechnet werden
                    graphicWidth: NaN,
                    type: "point"
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
                    style = buildSpecModel.getFeatureStyle(features[0], vectorLayer)[0];

                expect(buildSpecModel.getImageName(style.getImage().getSrc())).to.equal("/krankenhaus.png");
            });
        });
    });
});
