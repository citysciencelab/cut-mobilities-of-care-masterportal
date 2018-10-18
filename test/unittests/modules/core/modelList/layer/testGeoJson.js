import {expect} from "chai";
import GeoJsonLayerModel from "@modules/core/modelList/layer/geojson.js";
import Util from "@testUtil";
import Feature from "ol/Feature.js";

describe("core/modelList/layer/geojson", function () {
    var geojsonLayer,
        geojson,
        utilModel;

    before(function () {
        utilModel = new Util();
        geojson = utilModel.getGeoJsonTestFeatures();
        geojsonLayer = new GeoJsonLayerModel();
    });

    describe("parseDataToFeatures", function () {
        it("should return an array with the length 100", function () {
            var features = geojsonLayer.parseDataToFeatures(geojson);

            expect(features).to.have.lengthOf(100);
        });
        it("should return an array of ol.Feature", function () {
            var features = geojsonLayer.parseDataToFeatures(geojson);

            expect(features[0] instanceof Feature).to.be.true;
        });
    });

    describe("parseDataToFeatures", function () {
        it("should return an array of ol.Feature", function () {
            var features = geojsonLayer.parseDataToFeatures(geojson);

            features = geojsonLayer.transformFeatures(features, "EPSG:4326", "EPSG:25832");
        });
    });
});
