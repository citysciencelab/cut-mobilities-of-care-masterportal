import {transformNaNToNull} from "./transformNaNToNull";
import {expect} from "chai";
describe("transformNaNToNull", () => {
    it("should return null if the given input is not a number (NaN)", () => {
        expect(transformNaNToNull("I am a String.")).to.equal(null);
    });
    it("should should return the given input if it is a number", () => {
        expect(transformNaNToNull(42)).to.equal(42);
    });
});
