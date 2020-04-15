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
});
