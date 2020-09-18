import isURL from "../../isURL.js";
import {expect} from "chai";

describe("src/utils/isURL.js", () => {
    it("detects an URL in an incoming string", () => {
        const incomingString = "https://test.example.com";

        expect(isURL(incomingString)).to.be.true;
    });
    it("detects an URL in an incoming string", () => {
        const incomingString = "http://test.example.com";

        expect(isURL(incomingString)).to.be.true;
    });
    it("detects an HTML file in an incoming string", () => {
        const incomingString = "test.example.com/index.html";

        expect(isURL(incomingString)).to.be.true;
    });
    it("detects that an incoming string is not an URL or HTML file", () => {
        const incomingString = "test@mail.com";

        expect(isURL(incomingString)).to.be.false;
    });
    it("detects that an incoming string is not an URL or HTML file", () => {
        const incomingString = "089 / 1234567";

        expect(isURL(incomingString)).to.be.false;
    });
});

