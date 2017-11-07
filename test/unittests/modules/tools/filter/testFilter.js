define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../../../../modules/tools/filter/model.js");

    describe("modules/tools/filter/model", function () {
        before(function () {
            model = new Model();
        });
        describe("collectFilteredIds", function () {
            it("should return empty array for undefined input", function () {
                expect(model.collectFilteredIds(undefined))
                    .to.be.an("array")
                    .to.be.empty;
            });
        });
        describe("collectFeaturesIdsOfAllLayers", function () {
            it("should return empty array for undefined input", function () {
                expect(model.collectFeaturesIdsOfAllLayers(undefined))
                    .to.be.an("array")
                    .to.be.empty;
            });
        });
    });
});
