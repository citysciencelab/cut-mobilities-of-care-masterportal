import {expect} from "chai";
import Model from "@modules/zoomtofeature/model";
import Feature from "ol/Feature";

describe("zoomToFeature", function () {
    var model;

    before(function () {
        model = new Model();
    });

    describe("createIconFeature", function () {
        it("should be an ol/feature that contains a given name", function () {
            var featureCenter = [55, 44],
                featureName = "abc";

            expect(model.createIconFeature(featureCenter, featureName).get("name")).to.equal("abc");
        });

        it("should be an ol/feature that contains coordinates", function () {
            var featureCenter = [55, 44],
                featureName = "abc";

            expect(model.createIconFeature(featureCenter, featureName).getGeometry().getCoordinates()).to.have.deep.members([55, 44]);
        });

        it("should be an ol/feature that have empty coordinates by empty input array", function () {
            var featureCenter = [],
                featureName = "abc";

            expect(model.createIconFeature(featureCenter, featureName).getGeometry().getCoordinates()).to.be.an("array").that.is.empty;
        });

        it("should be an ol/feature that have undefined name by undefined input", function () {
            var featureCenter = [],
                featureName;

            expect(model.createIconFeature(featureCenter, featureName).get("name")).to.be.undefined;
        });
    });

    describe("createIconVectorLayer", function () {
        it("should return an VectorLayer with Source and given Features with given name", function () {
            var iconFeature = new Feature({
                name: "testName"
            });

            expect(model.createIconVectorLayer([iconFeature]).getSource().getFeatures()[0].get("name")).to.equal("testName");
        });

        it("should return an VectorLayer with Source and given Features with given name as undefined", function () {
            var iconFeature = new Feature({
                name: undefined
            });

            expect(model.createIconVectorLayer([iconFeature]).getSource().getFeatures()[0].get("name")).to.be.undefined;
        });
    });
});