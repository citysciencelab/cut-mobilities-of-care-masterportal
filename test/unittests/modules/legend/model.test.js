import LegendModel from "@modules/legend/model.js";
import {expect} from "chai";

describe("modules/legend", function () {
    var model;

    before(function () {
        model = new LegendModel();
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
});
