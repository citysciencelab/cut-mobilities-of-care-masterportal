define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/legend/model.js");

    describe("modules/legend", function () {
        var model;

        before(function () {
            model = Model;
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
    });
});
