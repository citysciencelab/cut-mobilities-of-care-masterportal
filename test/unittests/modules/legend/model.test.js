
import LegendModel from "@modules/legend/model.js";
import {expect} from "chai";
import sinon from "sinon";

describe("modules/legend", function () {
    let model,
        isMap3d = false;

    const layerList = [
        new Backbone.Model({
            isVisibleInMap: true,
            legendURL: "irgendwas",
            supported: ["2D", "3D"]
        }),
        new Backbone.Model({
            isVisibleInMap: true,
            legendURL: "nochwas",
            supported: ["2D"]
        }),
        new Backbone.Model({
            isVisibleInMap: true,
            legendURL: "ignore",
            supported: ["2D", "3D"]
        })
    ];

    before(function () {
        model = new LegendModel();
        sinon.stub(Radio, "request").callsFake(function (channel, topic) {
            if (topic === "isMap3d") {
                return isMap3d;
            }
            else if (topic === "getModelsByAttributes") {
                return layerList;
            }
            return null;
        });
    });

    after(function () {
        sinon.restore();
    });

    describe("creates correct legend definitions", function () {
        it("should return correct WMS legend", function () {
            expect(model.getLegendDefinition("Festgestellte Bebauungspläne", "WMS", ["https://geodienste.hamburg.de/HH_WMS_Bebauungsplaene?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=hh_hh_festgestellt"])).to.deep.equal({
                layername: "Festgestellte Bebauungspläne",
                legend: [{
                    img: ["https://geodienste.hamburg.de/HH_WMS_Bebauungsplaene?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=hh_hh_festgestellt"],
                    typ: "WMS"
                }]
            });
        });
        it("should return ignored legend", function () {
            expect(model.getLegendDefinition("Festgestellte Bebauungspläne", "WMS", "ignore")).to.deep.equal({
                layername: "Festgestellte Bebauungspläne",
                legend: null
            });
        });
    });

    describe("returns correct legend objects", function () {
        it("should return legend by single url", function () {
            expect(model.getLegendParamsFromURL("Fake", ["FakeURL1"], "WMS")).to.deep.equal({
                layername: "Fake",
                legend: [{
                    img: ["FakeURL1"],
                    typ: "WMS"
                }]
            });
        });
        it("should return legend by multiple urls", function () {
            expect(model.getLegendParamsFromURL("Fake", ["FakeURL1", "FakeURL2"], "WMS")).to.deep.equal({
                layername: "Fake",
                legend: [{
                    img: ["FakeURL1", "FakeURL2"],
                    typ: "WMS"
                }]
            });
        });
        it("should return legend from WMS by single url", function () {
            expect(model.getLegendParamsFromWMS("Fake", ["FakeURL1"])).to.deep.equal({
                layername: "Fake",
                legend: [{
                    img: ["FakeURL1"],
                    typ: "WMS"
                }]
            });
        });
        it("should return empty legend if no vector style is properly set up", function () {
            expect(model.getLegendParamsFromVector("Fake", "123")).to.deep.equal({
                layername: "Fake",
                legend: [{
                    img: [],
                    typ: "svg",
                    legendname: []
                }]
            });
        });
    });
    describe("determineValueNameOld", function () {
        const styleModel = new Backbone.Model();

        it("should return layername for style empty styleModel ", function () {
            expect(model.determineValueNameOld(styleModel, "layerThird")).to.equal("layerThird");
        });
        it("should return styleFieldValue for styleModel with the attribute styleFieldValue", function () {
            styleModel.set("styleFieldValue", "styleFieldValueSecond");
            expect(model.determineValueNameOld(styleModel, "layerThird")).to.equal("styleFieldValueSecond");
        });
        it("should return legendValue for styleModel with the attributes legendValue and styleFieldValue", function () {
            styleModel.set("legendValue", "legendValueFirst");
            expect(model.determineValueNameOld(styleModel, "layerThird")).to.equal("legendValueFirst");
        });
    });

    describe("filterLayersForLegend", function () {
        it("should return layerlist with valid 2d layers", function () {
            isMap3d = false;
            expect(model.filterLayersForLegend()).to.be.a("array").with.lengthOf(2);
        });
        it("should return layerlist with valid 3d layers", function () {
            isMap3d = true;
            expect(model.filterLayersForLegend()).to.be.a("array").with.lengthOf(1);
        });
    });

    describe("filterLegendUrl", function () {
        const layer1 = new Backbone.Model({
                legendURL: "",
                typ: "WMS"
            }),
            layer2 = new Backbone.Model({
                legendURL: "",
                typ: "WFS"
            }),
            layer3 = new Backbone.Model({
                legendURL: "ignore",
                typ: "WMS"
            }),
            layer4 = new Backbone.Model({
                legendURL: "",
                typ: "WMS"
            }),
            groupLayers1 = new Backbone.Model({
                layerSource: [layer1, layer2]
            });

        it("should return an empty array by empty array input", function () {
            expect(model.filterLegendUrl([])).to.be.an("array").that.is.empty;
        });
        it("should return a single layer", function () {
            expect(model.filterLegendUrl([layer1])).to.be.an("array");
        });
        it("should return an empty array by layer input legendURL=ignore", function () {
            expect(model.filterLegendUrl([layer3])).to.be.an("array").that.is.empty;
        });
        it("should return group layers", function () {
            expect(model.filterLegendUrl([groupLayers1])).to.be.an("array").that.include(groupLayers1);
        });
        it("should return group layer and ignore single layer with legendURL=ignore ", function () {
            expect(model.filterLegendUrl([groupLayers1, layer3])).to.be.an("array").that.include(groupLayers1);
        });
        it("should return group layer and single layer and ignore layer with legendURL=ignore", function () {
            expect(model.filterLegendUrl([groupLayers1, layer3, layer4])).to.be.an("array").that.include(groupLayers1, layer4);
        });
    });
});
