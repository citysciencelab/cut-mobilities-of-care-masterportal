import FeatureViaURL from "@modules/featureViaURL/model";
import {expect} from "chai";
import sinon from "sinon";

describe("featureViaURL", function () {
    const consoleErrorSpy = sinon.spy(),
        consoleWarnSpy = sinon.spy(),
        radioSpy = sinon.spy();

    beforeEach(function () {
        sinon.stub(console, "error").callsFake(consoleErrorSpy);
        sinon.stub(console, "warn").callsFake(consoleWarnSpy);
        sinon.stub(Radio, "trigger").callsFake(radioSpy);
    });
    afterEach(function () {
        sinon.restore();
        consoleErrorSpy.resetHistory();
        consoleWarnSpy.resetHistory();
        radioSpy.resetHistory();
    });
    describe.only("createGeoJSON", function () {
        const {createGeoJSON} = FeatureViaURL.prototype,
            geometryType = "Point",
            regExp = /\d+/;
        let features = [{coordinates: [10, 53.5], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}],
            geoJSON;

        it("should create a geoJSON Object containing the given features with the given geometryType and the given epsg code", function () {
            const epsg = 25832;

            geoJSON = createGeoJSON(epsg, features, geometryType);
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
            geoJSON = createGeoJSON(undefined, features, geometryType);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(features[index].coordinates);
                expect(feature.properties.coordLabel).to.eql(features[index].coordinates);
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(4326);
        });
        it("should trigger an alert if no coordinates were defined for a feature and the feature shouldn't be added to the Object", function () {
            features = [{label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(undefined, features, geometryType);

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
        it("should trigger an alert if the coordinates of a feature are not an Array and the feature shouldn't be added to the Object", function () {
            features = [{coordinates: {x: 10, y: 53.5}, label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(undefined, features, geometryType);

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
        it("should trigger an alert if the coordinates of a feature is just an empty Array and the feature shouldn't be added to the Object", function () {
            features = [{coordinates: [], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(undefined, features, geometryType);

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
        it("should trigger an alert if no label was defined for a feature and the feature shouldn't be added to the Object", function () {
            features = [{coordinates: [10, 53.5]}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(undefined, features, geometryType);

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
    });
});
