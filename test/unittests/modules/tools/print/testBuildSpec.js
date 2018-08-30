define(function (require) {
    var expect = require("chai").expect,
        BuildSpecModel = require("../../../../../modules/tools/print_/buildSpec.js"),
        model,
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
        model = new BuildSpecModel(attr);
    });

    describe("tools/print_/buildSpec", function () {
        describe("parseAddress", function () {
            it("should return empty string if all keys in address object are empty", function () {
                var address = {
                    street: "",
                    housenr: "",
                    postalCode: "",
                    city: ""
                };

                expect(model.parseAddress(address)).to.be.a("string").that.is.empty;
            });
            it("should return empty address object is empty", function () {
                expect(model.parseAddress({})).to.be.a("string").that.is.empty;
            });
            it("should return empty address object is undefined", function () {
                expect(model.parseAddress(undefined)).to.be.a("string").that.is.empty;
            });
        });
        describe("isOwnMetaRequest", function () {
            it("should return true if uniqueId is in uniqueIdList", function () {
                expect(model.isOwnMetaRequest(["1234", "5678"], "1234")).to.be.true;
            });
            it("should return false if uniqueId is NOT in uniqueIdList", function () {
                expect(model.isOwnMetaRequest(["1234", "5678"], "91011")).to.be.false;
            });
            it("should return false if uniqueId is undefined", function () {
                expect(model.isOwnMetaRequest(["1234", "5678"], undefined)).to.be.false;
            });
            it("should return false if uniqueIdList is undefined", function () {
                expect(model.isOwnMetaRequest(undefined, "91011")).to.be.false;
            });
            it("should return false if uniqueIdList and uniqueId is undefined", function () {
                expect(model.isOwnMetaRequest(undefined, undefined)).to.be.false;
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

                model.updateMetaData("testLayerName", parsedData);
                expect(model.get("attributes").legend).to.be.undefined;
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

                model.get("attributes").legend = legend;
                model.updateMetaData("testLayerName", parsedData);

                expect(model.get("attributes").legend.layers[0]).to.own.include({
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

                expect(model.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "wmsGetLegendGraphic",
                    geometryType: "",
                    imageUrl: "http://GetlegendGraphicRequest1",
                    color: "",
                    label: "Layer1"
                });
                expect(model.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
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

                expect(model.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "http://imgLink1",
                    color: "",
                    label: "Layer1"
                });
                expect(model.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
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

                expect(model.prepareLegendAttributes(layerParam)[0]).to.deep.own.include({
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "#000000",
                    label: "1 - 2"
                });
                expect(model.prepareLegendAttributes(layerParam)[1]).to.deep.own.include({
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "#ff0000",
                    label: "3 - 4"
                });
                expect(model.prepareLegendAttributes(layerParam)[2]).to.deep.own.include({
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

                expect(model.prepareGfiAttributes(gfiAttributes)[0]).to.deep.own.include({
                    key: "attr1",
                    value: "value1"
                });
                expect(model.prepareGfiAttributes(gfiAttributes)[1]).to.deep.own.include({
                    key: "attr2",
                    value: "value2"
                });
                expect(model.prepareGfiAttributes(gfiAttributes)[2]).to.deep.own.include({
                    key: "attr3",
                    value: "value3"
                });
            });
            it("should create empty gfi attributes array for empty attributes", function () {
                expect(model.prepareGfiAttributes({})).to.be.an("array").that.is.empty;
            });
            it("should create empty gfi attributes array for undefined attributes", function () {
                expect(model.prepareGfiAttributes({})).to.be.an("array").that.is.empty;
            });
        });
        describe("buildScale", function () {
            it("should create scale that is \"1:20000\" for number input", function () {
                model.buildScale(20000);
                expect(model.get("attributes").scale).to.deep.include("1:20000");
            });
            it("should create scale that is \"1:undefined\" for undefined input", function () {
                model.buildScale(undefined);
                expect(model.get("attributes").scale).to.deep.include("1:undefined");
            });

        });
        describe("addZero", function () {
            it("should create hex string part with leading 0 if input length === 1", function () {
                expect(model.addZero("A")).to.deep.include("0A");
            });
            it("should create hex string part without leading 0 if input length >1", function () {
                expect(model.addZero("ff")).to.deep.include("ff");
            });
        });
        describe("rgbArrayToHex", function () {
            it("should create hex string from rgbArray", function () {
                expect(model.rgbArrayToHex([255, 255, 255])).to.deep.include("#ffffff");
            });
            it("should create default hex string from empty rgbArray", function () {
                expect(model.rgbArrayToHex([])).to.deep.include("#000000");
            });
            it("should create default hex string from undefined rgbArray", function () {
                expect(model.rgbArrayToHex(undefined)).to.deep.include("#000000");
            });
            it("should create hex string from rgbArray with transparency", function () {
                expect(model.rgbArrayToHex([255, 0, 0, 1])).to.deep.include("#ff0000");
            });
        });
    });
});
