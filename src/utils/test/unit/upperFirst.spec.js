import {expect} from "chai";
import upperFirst from "../../upperFirst";

describe("src/utils/upperFirst.js", () => {
    it("should reply to anything but a string with an empty string", () => {
        expect(upperFirst(undefined)).to.be.a("string").and.to.be.empty;
        expect(upperFirst(null)).to.be.a("string").and.to.be.empty;
        expect(upperFirst(1234)).to.be.a("string").and.to.be.empty;
        expect(upperFirst(false)).to.be.a("string").and.to.be.empty;
        expect(upperFirst(true)).to.be.a("string").and.to.be.empty;
        expect(upperFirst({})).to.be.a("string").and.to.be.empty;
        expect(upperFirst([])).to.be.a("string").and.to.be.empty;
    });
    it("should upper the first char of the given string", () => {
        expect(upperFirst("upperFirst")).to.equal("UpperFirst");
    });
});
