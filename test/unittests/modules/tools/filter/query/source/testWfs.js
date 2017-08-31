define(function(require) {
    var expect = require("chai").expect,
        Radio = require("backbone.radio"),
        Util = require("util"),
        Model = require("../../../../../../../modules/tools/filter/query/source/wfs.js");

    describe("filter/query/source/wfs", function () {
        var model,
            utilModel,
            testFeatures;

        before(function () {
            model = new Model();
            utilModel = new Util();
            testFeatures = utilModel.createTestFeatures();
            console.log(testFeatures[0]);
        });
        describe("isValueMatch", function () {
            it("should match when feature matches at least one attribute value", function () {
                var attribute = {attrName: "teilnahme_geburtsklinik", values: ["Nein"]};

                expect(model.isValueMatch(testFeatures[0], attribute)).to.be.true;
            });
            it("should not match when feature matches none of the attribute values", function () {
                var attribute = {attrName: "teilnahme_geburtsklinik", values: ["haha"]};

                expect(model.isValueMatch(testFeatures[1], attribute)).to.be.false;
            });
            it("should not match when attribute values is empty", function () {
                var attribute = {attrName: "teilnahme_geburtsklinik", values: []};

                expect(model.isValueMatch(testFeatures[1], attribute)).to.be.false;
            });
        });
    });
});
