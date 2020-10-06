import {expect} from "chai";
import {isEmailAddress} from "../../isEmailAddress.js";

describe("src/utils/isEmailAddress.js", () => {
    it("detects an email address in an incoming string", () => {
        const incomingString = "example@email.com";

        expect(isEmailAddress(incomingString)).to.be.true;
    });

    it("detects email addresses in an incoming string with various second level domains", () => {
        expect(isEmailAddress("example@email.de")).to.be.true;
        expect(isEmailAddress("example@email.net")).to.be.true;
        expect(isEmailAddress("example@email.eu")).to.be.true;
        expect(isEmailAddress("example@email.uk")).to.be.true;
    });

    it("detects that an incoming string is not an email address", () => {
        expect(isEmailAddress("http://test.example.com")).to.be.false;
        expect(isEmailAddress(undefined)).to.be.false;
        expect(isEmailAddress(null)).to.be.false;
        expect(isEmailAddress(1234)).to.be.false;
        expect(isEmailAddress("string")).to.be.false;
        expect(isEmailAddress({})).to.be.false;
        expect(isEmailAddress([])).to.be.false;
        expect(isEmailAddress(false)).to.be.false;
        expect(isEmailAddress(true)).to.be.false;
    });
});
