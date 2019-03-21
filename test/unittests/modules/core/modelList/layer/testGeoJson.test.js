import {expect} from "chai";
import {assert} from "chai";
import GeoJsonLayerModel from "@modules/core/modelList/layer/geojson.js";
import MapView from "@modules/core/mapView.js";
import Util from "@testUtil";
import Feature from "ol/Feature.js";

describe("core/modelList/layer/geojson", function () {
    var geojsonLayer,
        geojson,
        utilModel;

    before(function () {
        utilModel = new Util();
        new MapView();
        geojson = utilModel.getGeoJsonTestFeatures();
        geojsonLayer = new GeoJsonLayerModel();
    });

    describe("createLayerSource", function () {
        it("should createLayerSource", function () {
            geojsonLayer.createLayerSource();

            expect(geojsonLayer.attributes).to.have.property('layerSource');
            assert.typeOf(geojsonLayer.attributes.layerSource, "Object");
            expect(geojsonLayer.attributes).not.to.have.property('clusterLayerSource');
        });
        it("should createClusterLayerSource", function () {
            geojsonLayer.set("clusterDistance", 20);
            geojsonLayer.createLayerSource();

            expect(geojsonLayer.attributes).to.have.property('layerSource');
            assert.typeOf(geojsonLayer.attributes.layerSource, "Object");
            expect(geojsonLayer.attributes).to.have.property('clusterLayerSource');
            assert.typeOf(geojsonLayer.attributes.clusterLayerSource, "Object");
        });
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

    describe("transformFeatures", function () {
        it("should transform an array of ol.Feature", function () {
            var features = geojsonLayer.parseDataToFeatures(geojson);

            features = geojsonLayer.transformFeatures(features, "EPSG:4326", "EPSG:3857");
            expect(features[0].getGeometry().getExtent()).to.be.an("array");
            expect(features[0].getGeometry().getExtent()[0]).to.equal(1121739.1650062224);
            expect(features[0].getGeometry().getExtent()[1]).to.equal(7079309.277828476);
            expect(features[0].getGeometry().getExtent()[2]).to.equal(1122347.5029925175);
            expect(features[0].getGeometry().getExtent()[3]).to.equal(7079926.307314908);
        });
    });
});
