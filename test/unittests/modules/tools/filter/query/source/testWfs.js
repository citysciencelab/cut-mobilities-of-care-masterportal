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
        describe("initIsMatch", function () {
            it("should set isMatch to true on all passed features", function () {
                model.initIsMatchToTrue(testFeatures);
                _.each(testFeatures, function (testFeature) {
                    expect(testFeature.get("isMatch")).to.be.true;
                });
            });
        });
        describe("collectAttributeValues", function () {
            before(function () {
                model = new Model();
                utilModel = new Util();
                testFeatures = [],
                values = [];
                allTestFeatures = utilModel.createTestFeatures();
                // use subset for easier testing
                for (var i = 0; i <= 2; i++) {
                    testFeatures.push(allTestFeatures[i]);
                }
                _.each(testFeatures, function (feature) {
                    _.each(feature.values_, function (value) {
                        values.push(value);
                    });
                });
            });
            it("should update Snippets so that only available options are rendered", function () {
                model.initIsMatchToFalse(testFeatures);
                _.each(testFeatures, function (testFeature) {
                    expect(testFeature.get("isMatch")).to.be.true;
                });
            });
        });
    });
});
