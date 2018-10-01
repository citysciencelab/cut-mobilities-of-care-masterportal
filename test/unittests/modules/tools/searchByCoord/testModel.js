import {expect} from "chai";
import Model from "@modules/tools/searchByCoord/model.js";

var etrs89Coord = [{"coord": "5935103,67", "key": "Wert der Länge"}, {"coord": "564459.13", "key": "Wert der Breite"}],
    etrs89ErrCoordNorthing = [{"coord": "5935103,67", "key": "Wert der Länge"}, {"coord": "qwertz", "key": "Wert der Breite"}],
    etrs89ErrCoordEasting = [{"coord": "qwertz", "key": "Wert der Länge"}, {"coord": "564459.13", "key": "Wert der Breite"}],
    wgs84Coord = [{"coord": "9° 30` 50``", "key": "Wert der Länge"}, {"coord": "53° 10' 55\"", "key": "Wert der Breite"}],
    wgs84ErrCoordNorthing = [{"coord": "9° 59' 50", "key": "Wert der Länge"}, {"coord": "qwertz", "key": "Wert der Breite"}],
    wgs84ErrCoordEasting = [{"coord": "qwertz", "key": "Wert der Länge"}, {"coord": "53° 33` 25", "key": "Wert der Breite"}],
    wgsDezimalCoord = [{"coord": "53.5555°", "key": "Wert der Länge"}, {"coord": "10,01234", "key": "Wert der Breite"}],
    wgsDezimalErrCoordNorthing = [{"coord": "53.5555°", "key": "Wert der Länge"}, {"coord": "qwertz", "key": "Wert der Breite"}],
    wgsDezimalErrCoordEasting = [{"coord": "qwertz", "key": "Wert der Länge"}, {"coord": "10,01234", "key": "Wert der Breite"}],
    undefCoord = [{"key": "Wert der Länge"}, {"key": "Wert der Breite"}],
    model;

before(function () {
    model = new Model();
});

describe("function for validate input", function () {
    describe("validate for etrs89", function () {
        it("should return true if valid", function () {
            model.set("coordSystem", "WGS84");
            model.set("coordinates", wgs84Coord);
            expect(model.isValid()).to.be.true;
        });
        it("should return true if valid", function () {
            model.set("coordinates", undefCoord);
            expect(model.isValid()).to.be.false;
        });
        it("should return true if valid", function () {
            model.set("coordinates", wgs84ErrCoordNorthing);
            expect(model.isValid()).to.be.false;
        });
        it("should return true if valid", function () {
            model.set("coordinates", wgs84ErrCoordEasting);
            expect(model.isValid()).to.be.false;
        });
    });
    describe("validate for wgs84", function () {
        it("should return true if valid", function () {
            model.set("coordSystem", "ETRS89");
            model.set("coordinates", etrs89Coord);
            expect(model.isValid()).to.be.true;
        });
        it("should return true if valid", function () {
            model.set("coordinates", undefCoord);
            expect(model.isValid()).to.be.false;
        });
        it("should return true if valid", function () {
            model.set("coordinates", etrs89ErrCoordNorthing);
            expect(model.isValid()).to.be.false;
        });
        it("should return true if valid", function () {
            model.set("coordinates", etrs89ErrCoordEasting);
            expect(model.isValid()).to.be.false;
        });
    });
    describe("validate for wgs84", function () {
        it("should return true if valid", function () {
            model.set("coordSystem", "WGS84(Dezimalgrad)");
            model.set("coordinates", wgsDezimalCoord);
            expect(model.isValid()).to.be.true;
        });
        it("should return true if valid", function () {
            model.set("coordinates", undefCoord);
            expect(model.isValid()).to.be.false;
        });
        it("should return true if valid", function () {
            model.set("coordinates", wgsDezimalErrCoordNorthing);
            expect(model.isValid()).to.be.false;
        });
        it("should return true if valid", function () {
            model.set("coordinates", wgsDezimalErrCoordEasting);
            expect(model.isValid()).to.be.false;
        });
    });
});
