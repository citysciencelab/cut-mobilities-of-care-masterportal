import {expect} from "chai";
import getters from "../../../store/gettersBackForward.js";

const {backAvailable, forthAvailable} = getters;

describe("gettersBackForward", function () {
    describe("backAvailable", function () {
        it("returns false if no position exists yet (initial state)", function () {
            expect(backAvailable({
                position: null,
                memory: []
            })).to.be.false;
        });
        it("returns false if first position is selected", function () {
            expect(backAvailable({
                position: 0,
                memory: [{center: [0, 0], zoom: 0}]
            })).to.be.false;

            expect(backAvailable({
                position: 0,
                memory: [{center: [0, 0], zoom: 0}, {center: [0, 0], zoom: 0}]
            })).to.be.false;
        });
        it("returns true if previous position exists", function () {
            expect(backAvailable({
                position: 1,
                memory: [{center: [0, 0], zoom: 0}, {center: [0, 0], zoom: 0}]
            })).to.be.true;
        });
    });
    describe("forthAvailable", function () {
        it("returns false if no position exists yet (initial state)", function () {
            expect(forthAvailable({
                position: null,
                memory: []
            })).to.be.false;
        });
        it("returns false if last position is selected", function () {
            expect(forthAvailable({
                position: 0,
                memory: [{center: [0, 0], zoom: 0}]
            })).to.be.false;

            expect(forthAvailable({
                position: 1,
                memory: [{center: [0, 0], zoom: 0}, {center: [0, 0], zoom: 0}]
            })).to.be.false;
        });
        it("returns true if next position exists", function () {
            expect(forthAvailable({
                position: 0,
                memory: [{center: [0, 0], zoom: 0}, {center: [0, 0], zoom: 0}]
            })).to.be.true;
        });
    });
});
