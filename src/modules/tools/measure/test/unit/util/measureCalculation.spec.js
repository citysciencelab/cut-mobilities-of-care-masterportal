import {Polygon, LineString} from "ol/geom.js";
import Feature from "ol/Feature.js";

import {expect} from "chai";

import {calculateLineLengths, calculatePolygonAreas} from "../../../util/measureCalculation";

describe("tools/measure/util/measureCalculation", function () {
    describe("calculateLineLengths", function () {
        it("should format measured linestring(s) in m/km correctly", function () {
            const feature = new Feature({
                geometry: new LineString([[0, 0], [1, 1]])
            });
            let result;

            result = calculateLineLengths("EPSG:4326", {}, 6378137, "0");
            expect(result).to.deep.equal({});

            result = calculateLineLengths("EPSG:4326", {a: feature}, 6378137, "0");
            expect(result).to.deep.equal({a: "157426 m"});

            result = calculateLineLengths("EPSG:4326", {a: feature, b: feature}, 6378137, "1");
            expect(result).to.deep.equal({a: "157.4 km", b: "157.4 km"});
        });
    });

    describe("calculatePolygonAreas", function () {
        it("should format measured polygon(s) in m/km correctly", function () {
            const feature = new Feature({
                geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
            });
            let result;

            result = calculatePolygonAreas("EPSG:4326", {}, 6378137, "0");
            expect(result).to.deep.equal({});

            result = calculatePolygonAreas("EPSG:4326", {a: feature}, 6378137, "0");
            expect(result).to.deep.equal({a: "12391399902 m²"});

            result = calculatePolygonAreas("EPSG:4326", {a: feature, b: feature}, 6378137, "1");
            expect(result).to.deep.equal({a: "12391.4 km²", b: "12391.4 km²"});
        });
    });
});
