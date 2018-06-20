define(function (require) {
    var expect = require("chai").expect,
        Util = require("util"),
        Model = require("../../../../../../modules/tools/compareFeatures/model.js");

    describe("filter/query/source/wfs", function () {
        var model,
            utilModel,
            testFeatures;

        before(function () {
            model = new Model();
            utilModel = new Util();
            testFeatures = utilModel.createTestFeatures("resources/testFeatures.xml");
            testFeatures.forEach(function (feature) {
                feature.set("layerId", "1711");
                feature.set("layerName", "Krankenhäuser");
                feature.setId(_.uniqueId());
            });
            testFeatures[10].set("layerId", "1234");
            testFeatures[11].set("layerId", "1234");
        });

        describe("isFeatureListFull", function () {
            it("should return false if there is only one feature per layer in the list", function () {
                model.addFeatureToList(testFeatures[0]);
                expect(model.isFeatureListFull(testFeatures[0].get("layerId"), model.get("groupedFeatureList"), model.get("maxFeatures"))).to.be.false;
            });
            it("should return true if there are already three features per layer in the list", function () {
                model.addFeatureToList(testFeatures[1]);
                model.addFeatureToList(testFeatures[2]);
                model.addFeatureToList(testFeatures[10]);
                expect(model.isFeatureListFull(testFeatures[3].get("layerId"), model.get("groupedFeatureList"), model.get("maxFeatures"))).to.be.true;
            });
        });

        describe("groupedFeaturesBy", function () {
            it("should return an object with the keys '1711' and '1234'", function () {
                var groupedFeatures = model.groupedFeaturesBy(model.get("featureList"), "layerId");

                expect(groupedFeatures).to.have.all.key("1711", "1234");
            });
            it("should return an array with a length of three for features with layer id 1711", function () {
                expect(model.get("groupedFeatureList")["1711"]).to.have.lengthOf(3);
            });
            it("should return an array with a length of one for features with layer id 1234", function () {
                expect(model.get("groupedFeatureList")["1234"]).to.have.lengthOf(1);
            });
        });

        describe("setFeatureIsOnCompareList", function () {
            it("should be on the compare list", function () {
                model.setFeatureIsOnCompareList(testFeatures[0], true);
                expect(testFeatures[0].get("isOnCompareList")).to.be.true;
            });
            it("should be on the compare list", function () {
                model.setFeatureIsOnCompareList(testFeatures[1], false);
                expect(testFeatures[1].get("isOnCompareList")).to.be.false;
            });
        });

        describe("removeFeatureFromList", function () {
            it("should expect a feature list of three features", function () {
                model.removeFeatureFromList(testFeatures[1]);
                expect(model.get("featureList")).to.have.lengthOf(3);
            });
            it("should expect a feature list of three features", function () {
                model.removeFeatureFromList(testFeatures[8]);
                expect(model.get("featureList")).to.have.lengthOf(3);
            });
            it("should expect a feature list of two features", function () {
                model.removeFeatureFromList(testFeatures[2]);
                expect(model.get("featureList")).to.have.lengthOf(2);
            });
        });

        describe("addFeatureToList", function () {
            it("should expect a feature list of two features", function () {
                model.addFeatureToList(testFeatures[1]);
                expect(model.get("featureList")).to.have.lengthOf(3);
            });
            it("should expect a feature list of three features", function () {
                model.addFeatureToList(testFeatures[11]);
                expect(model.get("featureList")).to.have.lengthOf(4);
            });
        });
    });
});
