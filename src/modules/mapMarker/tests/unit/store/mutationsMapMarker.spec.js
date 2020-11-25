import {expect} from "chai";
import mutations from "../../../store/mutationsMapMarker";

import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";
import {WKT} from "ol/format.js";

const {addFeatureToMarker, clearMarker, setVisibilityMarker} = mutations;

describe("src/modules/mapMarker/store/mutationsMapMarker.js", () => {

    describe("addFeatureToMarker", () => {
        it("adds a feture to pointMapmarker", () => {
            const state = {
                    markerPoint: new VectorLayer({
                        name: "markerPoint",
                        source: new VectorSource(),
                        alwaysOnTop: true,
                        visible: false,
                        style: new Style()
                    })
                },
                feature = new Feature({
                    geometry: new Point([1, 1])
                });

            addFeatureToMarker(state, {feature: feature, marker: "markerPoint"});

            expect(state.markerPoint.getSource().getFeatures().length).to.equals(1);
            expect(state.markerPoint.getSource().getFeatures()[0]).to.equals(feature);
        });

        it("adds a feature to polygonMapmarker", async () => {
            const state = {
                    markerPolygon: new VectorLayer({
                        name: "markerPolygon",
                        source: new VectorSource(),
                        alwaysOnTop: true,
                        visible: false,
                        style: new Style()
                    })
                },
                format = new WKT(),
                wkt = "POLYGON((56823.505 5935309.742, 568274.048 5935312.392, 568278.25 5935295.716, 568267.8 5935293.091, 568266.095 5935292.663, 568265.517 5935295.139, 568262.185 5935309.41, 568263.505 5935309.742))",
                feature = format.readFeature(wkt);

            addFeatureToMarker(state, {feature: feature, marker: "markerPolygon"});

            expect(state.markerPolygon.getSource().getFeatures().length).to.equals(1);
            expect(state.markerPolygon.getSource().getFeatures()[0]).to.equals(feature);
        });
    });

    describe("clearMarker", () => {
        it("clear vectorSource of pointMapmarker", () => {
            const state = {
                markerPoint: new VectorLayer({
                    name: "markerPoint",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: false,
                    style: new Style()
                })
            };

            clearMarker(state, "markerPoint");

            expect(state.markerPoint.getSource().getFeatures().length).to.equals(0);
        });

        it("clear vectorSource of pointMapmarker after addFeatureToMarker", () => {
            const state = {
                    markerPoint: new VectorLayer({
                        name: "markerPoint",
                        source: new VectorSource(),
                        alwaysOnTop: true,
                        visible: false,
                        style: new Style()
                    })
                },
                feature = new Feature({
                    geometry: new Point([1, 1])
                });

            addFeatureToMarker(state, {feature: feature, marker: "markerPoint"});
            clearMarker(state, "markerPoint");

            expect(state.markerPoint.getSource().getFeatures().length).to.equals(0);
        });

        it("clear vectorSource of polygonMapmarker", () => {
            const state = {
                markerPolygon: new VectorLayer({
                    name: "markerPolygon",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: false,
                    style: new Style()
                })
            };

            clearMarker(state, "markerPolygon");

            expect(state.markerPolygon.getSource().getFeatures().length).to.equals(0);
        });
    });

    describe("setVisibilityMarker", () => {
        it("sets the visbility of pointMapmarker from false to true", () => {
            const state = {
                markerPoint: new VectorLayer({
                    name: "markerPoint",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: false,
                    style: new Style()
                })
            };

            setVisibilityMarker(state, {visibility: true, marker: "markerPoint"});

            expect(state.markerPoint.getVisible()).to.be.true;
        });

        it("sets the visbility of pointMapmarker from true to false", () => {
            const state = {
                markerPoint: new VectorLayer({
                    name: "markerPoint",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: true,
                    style: new Style()
                })
            };

            setVisibilityMarker(state, {visibility: false, marker: "markerPoint"});

            expect(state.markerPoint.getVisible()).to.be.false;
        });

        it("sets the visbility of polygonMapmarker from false to true", () => {
            const state = {
                markerPolygon: new VectorLayer({
                    name: "markerPolygon",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: false,
                    style: new Style()
                })
            };

            setVisibilityMarker(state, {visibility: true, marker: "markerPolygon"});

            expect(state.markerPolygon.getVisible()).to.be.true;
        });

        it("sets the visbility of polygonMapmarker from true to false", () => {
            const state = {
                markerPolygon: new VectorLayer({
                    name: "markerPolygon",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: true,
                    style: new Style()
                })
            };

            setVisibilityMarker(state, {visibility: false, marker: "markerPolygon"});

            expect(state.markerPolygon.getVisible()).to.be.false;
        });
    });
});
