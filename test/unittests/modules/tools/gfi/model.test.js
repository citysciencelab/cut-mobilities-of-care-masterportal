import Model from "@modules/tools/gfi/model.js";
import {expect} from "chai";

let model;
const longitudeMax = 900000.0,
    longitudeMin = 300000.0,
    latitudeMax = 6200000.0,
    latitudeMin = 5000000.0,
    evt = {
        type: "click",
        target: Map,
        map: Map,
        originalEvent: {},
        coordinate: [
            Math.random() * (longitudeMax - longitudeMin) + longitudeMin,
            Math.random() * (latitudeMax - latitudeMin) + latitudeMin
        ]
    };

before(function () {
    model = new Model();
});

describe("tools/gfi/Model", function () {
    describe("getClickedCoordinate", function () {
        it("should return undefined for true as input event", function () {
            expect(model.getClickedCoordinate(true, true)).to.be.undefined;
        });
        it("should return undefined for false as input event", function () {
            expect(model.getClickedCoordinate(false, false)).to.be.undefined;
        });
        it("should return undefined for true as input event", function () {
            expect(model.getClickedCoordinate(false, true)).to.be.undefined;
        });
        it("should return undefined for false as input event", function () {
            expect(model.getClickedCoordinate(true, false)).to.be.undefined;
        });
        it("should return undefined output for undefined and empty input", function () {
            expect(model.getClickedCoordinate(undefined, {})).to.be.undefined;
        });
        it("should return undefined output for an empty input event", function () {
            expect(model.getClickedCoordinate(false, {})).to.be.undefined;
        });
        it("should return undefined output for an empty input event", function () {
            expect(model.getClickedCoordinate(true, {})).to.be.undefined;
        });
        it("should return an array with two values for true and a defined event as input", function () {
            expect(model.getClickedCoordinate(true, evt)).to.be.an("array").that.is.not.empty;
            expect(model.getClickedCoordinate(true, evt).length).to.be.equal(2);
            expect(model.getClickedCoordinate(true, evt)[0]).to.be.an("number");
            expect(model.getClickedCoordinate(true, evt)[1]).to.be.an("number");
        });
        it("should return an array with to values for false and a defined event as input", function () {
            expect(model.getClickedCoordinate(false, evt)).to.be.an("array").that.is.not.empty;
            expect(model.getClickedCoordinate(false, evt).length).to.be.equal(2);
            expect(model.getClickedCoordinate(false, evt)[0]).to.be.an("number");
            expect(model.getClickedCoordinate(false, evt)[1]).to.be.an("number");
        });
    });
});
