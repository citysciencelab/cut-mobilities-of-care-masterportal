import Model from "@modules/zoomToFeature/model";
import Feature from "ol/Feature";
const chai = require("chai");

describe("zoomToFeature", function () {
    let model;
    const expect = chai.expect;

    before(function () {
        const CustomZoomToFeatureModel = Model.extend({
            requestFeaturesFromWFS: function () {
                // This function is mocked since it triggers an ajax request.
            }
        });

        model = new CustomZoomToFeatureModel();
    });

    describe("createIconFeature", function () {
        it("should be an ol/feature that contains a given name", function () {
            const featureCenter = [55, 44],
                featureName = "abc";

            expect(model.createIconFeature(featureCenter, featureName).get("name")).to.equal("abc");
        });

        it("should be an ol/feature that contains coordinates", function () {
            const featureCenter = [55, 44],
                featureName = "abc";

            expect(model.createIconFeature(featureCenter, featureName).getGeometry().getCoordinates()).to.have.deep.members([55, 44]);
        });

        it("should be an ol/feature that have empty coordinates by empty input array", function () {
            const featureCenter = [],
                featureName = "abc";

            expect(model.createIconFeature(featureCenter, featureName).getGeometry().getCoordinates()).to.be.an("array").that.is.empty;
        });

        it("should be an ol/feature that have undefined name by undefined input", function () {
            const featureCenter = [];
            let featureName;

            expect(model.createIconFeature(featureCenter, featureName).get("name")).to.be.undefined;
        });
    });

    describe("createIconVectorLayer", function () {
        it("should return an VectorLayer with Source and given Features with given name", function () {
            const iconFeature = new Feature({
                name: "testName"
            });

            expect(model.createIconVectorLayer([iconFeature]).getSource().getFeatures()[0].get("name")).to.equal("testName");
        });

        it("should return an VectorLayer with Source and given Features with given name as undefined", function () {
            const iconFeature = new Feature({
                name: undefined
            });

            expect(model.createIconVectorLayer([iconFeature]).getSource().getFeatures()[0].get("name")).to.be.undefined;
        });
    });
});
