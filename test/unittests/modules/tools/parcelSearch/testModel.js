define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../../modules/tools/parcelSearch/model.js");

    describe("tools/Flurstückssuche", function () {
        var model;

        before(function () {
            model = new Model();
        });

        describe("buildUrl", function () {
            it("should create url if params is an empty object", function () {
                expect(model.buildUrl("www.url.de?", {})).to.have.string("www.url.de\?");
            });
            it("should return url if params is an object with number as val", function () {
                expect(model.buildUrl("www.url.de?", {test: 1})).to.have.string("www.url.de?test=1");
            });
            it("should return url if params is an object with bool as val", function () {
                expect(model.buildUrl("www.url.de?", {test: false})).to.have.string("www.url.de?test=false");
            });
        });
    });
});
