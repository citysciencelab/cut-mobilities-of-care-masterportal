define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/core/map.js"),
        Util = require("util");

    describe("core/map", function () {
        var model,
            utilModel,
            features;

        before(function () {
            model = new Model();
            utilModel = new Util();
            features = utilModel.createTestFeatures();
        });

        describe("calculateExtent", function () {
            it("should return extent that is not undefined", function () {
                expect(model.calculateExtent(features)).not.to.be.undefined;
            });
            it("should return extent that does not contain 9999999", function () {
                expect(model.calculateExtent(features)).to.be.an("array").that.not.includes(9999999);
            });
            it("should return extent that does not contain 0", function () {
                expect(model.calculateExtent(features)).to.be.an("array").that.not.includes(0);
            });
            it("should return extent with 0 <= xMin <= 9999999", function () {
                expect(model.calculateExtent(features)[0]).to.be.within(0, 9999999);
            });
            it("should return extent with 0 <= yMin <= 9999999", function () {
                expect(model.calculateExtent(features)[1]).to.be.within(0, 9999999);
            });
            it("should return extent with 0 <= xMax <= 9999999", function () {
                expect(model.calculateExtent(features)[2]).to.be.within(0, 9999999);
            });
            it("should return extent with 0 <= yMax <= 9999999", function () {
                expect(model.calculateExtent(features)[3]).to.be.within(0, 9999999);
            });
        });
    });
});
