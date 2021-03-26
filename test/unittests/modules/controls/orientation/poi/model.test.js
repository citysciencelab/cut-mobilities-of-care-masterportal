import Model from "@modules/controls/orientation/poi/model.js";
import Feature from "ol/Feature.js";
import {expect} from "chai";

describe("POI (In meiner Nähe)", function () {
    let model;

    const distances = [500, 1000, 2000];

    before(function () {
        model = Model;
        model.setPoiDistances(distances);
    });

    describe("getFeatureTitle", function () {
        let feature = new Feature();

        it("should return featureId when other info is unset", function () {
            feature.setId("123");
            expect(model.getFeatureTitle(feature)).to.be.an("string").to.equal("123");
        });
        it("should return layerName when name is unset", function () {
            feature = Object.assign(feature, {
                layerName: "LayerName"
            });
            expect(model.getFeatureTitle(feature)).to.be.an("string").to.equal("LayerName");
        });
        it("should return name when set", function () {
            feature.set("name", "Name");
            expect(model.getFeatureTitle(feature)).to.be.an("string").to.equal("Name");
        });
    });
});
