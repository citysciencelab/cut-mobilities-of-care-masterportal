define(function(require) {
    var expect = require("chai").expect,
        Radio = require("backbone.radio"),
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
    });
});
