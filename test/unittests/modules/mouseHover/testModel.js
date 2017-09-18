define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/mouseHover/model.js");

    describe("mouseHover", function () {
        var model;

        before(function () {
            model = new Model();
        });

        describe("fillFeatureArray", function () {
            it("should return empty Array when featureAtPixel undefined", function () {
                expect(model.fillFeatureArray(undefined)).to.be.an("array").that.is.empty;
            });
        });
        describe("getLayerInfosFromWfsList", function () {
            it("should not find layerInfos when element.layerId not in wfsList", function () {
                var element = {
                    feature: undefined, //not relevant for this test
                    layerId: "9999"
                };

                expect(model.getLayerInfosFromWfsList(element)).to.be.undefined;
            });
        });
    });
});
