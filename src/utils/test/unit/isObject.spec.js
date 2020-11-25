import {expect} from "chai";
import isObject from "../../isObject";

describe("src/utils/isObject.js", () => {
    describe("isObject", () => {
        it("should return false if undefined is passed", () => {
            expect(isObject(undefined)).to.be.false;
        });

        it("should return false if null is passed", () => {
            expect(isObject(null)).to.be.false;
        });

        it("should return false if true is passed", () => {
            expect(isObject(true)).to.be.false;
        });

        it("should return false if false is passed", () => {
            expect(isObject(false)).to.be.false;
        });

        it("should return false if an array is passed", () => {
            expect(isObject([])).to.be.false;
        });

        it("should return false if a number is passed", () => {
            expect(isObject(4)).to.be.false;
        });

        it("should return false if a string is passed", () => {
            expect(isObject("Test")).to.be.false;
        });

        it("should return true if an object is passed", () => {
            expect(isObject({})).to.be.true;
        });
    });
});
