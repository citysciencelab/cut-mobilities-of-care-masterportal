import FeatureViaURL from "@modules/featureViaURL/model";
import {expect} from "chai";

describe("featureViaURL", function () {
    describe("createGeoJSON", function () {
        const regExp = /\d+/;
        let features,
            geoJSON,
            geometryType,
            model;

        it("should a geoJSON Object containing the given features with the given geometryType and the given epsg code", function () {
            const epsg = 25832;

            features = [{coordinates: [10, 53.5], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geometryType = "Point";
            model = new FeatureViaURL();

            geoJSON = model.createGeoJSON(epsg, features, geometryType);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(features[index].coordinates);
                expect(feature.properties.coordLabel).to.eql(features[index].coordinates);
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(epsg);
        });
        it("should create a geoJSON containing the given features with the given geometryType and EPSG Code 4326 if no code was given", function () {
            features = [{coordinates: [10, 53.5], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geometryType = "Point";
            model = new FeatureViaURL();

            geoJSON = model.createGeoJSON(undefined, features, geometryType);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(features[index].coordinates);
                expect(feature.properties.coordLabel).to.eql(features[index].coordinates);
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(4326);
        });
    });
});
