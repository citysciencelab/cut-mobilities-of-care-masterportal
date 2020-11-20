import substrStartFromValue from "../../substrStartFromValue.js";
import {expect} from "chai";

describe("src/utils/substrStartFromValue.js", () => {
    it("should return false if only one param is given", () => {
        expect(substrStartFromValue("Moin moin")).to.be.false;
    });

    it("should return false if the first param is not a string", () => {
        expect(substrStartFromValue(undefined, "Moin moin")).to.be.false;
        expect(substrStartFromValue(null, "Moin moin")).to.be.false;
        expect(substrStartFromValue([], "Moin moin")).to.be.false;
        expect(substrStartFromValue({}, "Moin moin")).to.be.false;
        expect(substrStartFromValue(false, "Moin moin")).to.be.false;
        expect(substrStartFromValue(true, "Moin moin")).to.be.false;
        expect(substrStartFromValue(5, "Moin moin")).to.be.false;
    });

    it("should return false if the second param is not a string", () => {
        expect(substrStartFromValue("Moin moin", undefined)).to.be.false;
        expect(substrStartFromValue("Moin moin", null)).to.be.false;
        expect(substrStartFromValue("Moin moin", [])).to.be.false;
        expect(substrStartFromValue("Moin moin", {})).to.be.false;
        expect(substrStartFromValue("Moin moin", false)).to.be.false;
        expect(substrStartFromValue("Moin moin", true)).to.be.false;
        expect(substrStartFromValue("Moin moin", 5)).to.be.false;
    });

    it("should return origin string if second param not found", () => {
        expect(substrStartFromValue("Moin moin", "Tschuess")).to.equal("Moin moin");
    });

    it("should return substring starting from the second param", () => {
        expect(substrStartFromValue("Moin moin", "i")).to.equal("n moin");
        expect(substrStartFromValue("Moin moin", "mo")).to.equal("in");
    });
});

