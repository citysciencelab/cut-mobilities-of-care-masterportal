import MeasureModel from "@modules/tools/measure/model.js";
import {Polygon, LineString} from "ol/geom.js";
import Feature from "ol/Feature.js";
import {expect} from "chai";

let model;

before(function () {
    model = new MeasureModel();
});

describe("tools/measure/model", function () {
    describe("formatLength", function () {
        it("should format measured linestring in m at scale 1000", function () {
            const geom = new LineString([[0, 0], [1000, 0]]);

            model.setScale(1000);
            model.setUnit("m");
            expect(model.formatLength(geom)).to.deep.equal({
                measure: "997.32 m",
                deviance: "(+/- 1.00 m)"
            });
        });
        it("should format measured linestring in km at scale 1000", function () {
            const geom = new LineString([[0, 0], [1000, 0]]);

            model.setScale(1000);
            model.setUnit("km");
            expect(model.formatLength(geom)).to.deep.equal({
                measure: "0.997 km",
                deviance: "(+/- 0.001 km)"
            });
        });
    });
    describe("formatArea", function () {
        it("should format measured area in m² at scale 1000", function () {
            const geom = new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]]);

            model.setScale(1000);
            model.setUnit("m²");
            expect(model.formatArea(geom)).to.deep.equal({
                measure: "500669 m²",
                deviance: "(+/- 1000 m²)"
            });
        });
        it("should format measured area in km² at scale 1000", function () {
            const geom = new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]]);

            model.setScale(1000);
            model.setUnit("km²");
            expect(model.formatArea(geom)).to.deep.equal({
                measure: "0.50 km²",
                deviance: "(+/- 0.00 km²)"
            });
        });
    });
    describe("generateTextPoint", function () {
        it("should generate point at last position of LineString", function () {
            const geom = new LineString([[0, 0], [1000, 0]]),
                feature = new Feature({geometry: geom});

            let textPoint = {};

            model.set("drawingFeature", feature);
            model.setScale(1000);
            model.setUnit("m");

            textPoint = model.generateTextPoint(feature);

            expect(textPoint.getGeometry().getLastCoordinate()).to.deep.equal([1000, 0]);

        });
        it("should generate point at last position of Polygon", function () {
            const geom = new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]]),
                feature = new Feature({geometry: geom});
            let textPoint = {};

            model.set("drawingFeature", feature);
            model.setScale(1000);
            model.setUnit("m");

            textPoint = model.generateTextPoint(feature);

            expect(textPoint.getGeometry().getLastCoordinate()).to.deep.equal([0, 1000]);
        });
    });
    describe("generateTextStyles", function () {
        it("should generate textStyles for LineString", function () {
            const geom = new LineString([[0, 0], [1000, 0]]),
                feature = new Feature({geometry: geom});
            let textStyles = {};

            model.set("drawingFeature", feature);
            model.setScale(1000);
            model.setUnit("m");

            textStyles = model.generateTextStyles(feature);

            expect(textStyles).to.be.an("array").of.length(2);
            expect(textStyles[0].getText().getText()).to.equal("997.32 m");
            expect(textStyles[1].getText().getText()).to.equal("(+/- 1.00 m)");
        });
        it("should generate textStyles for Polygon", function () {
            const geom = new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]]),
                feature = new Feature({geometry: geom});

            model.set("drawingFeature", feature);
            model.setScale(1000);
            model.setUnit("m");

            /* eslint-disable-next-line one-var */
            const textStyles = model.generateTextStyles(feature);

            expect(textStyles).to.be.an("array").of.length(2);
            expect(textStyles[0].getText().getText()).to.equal("500669 m");
            expect(textStyles[1].getText().getText()).to.equal("(+/- 1000 m)");
        });
    });
});
