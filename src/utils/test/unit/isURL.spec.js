import isURL from "../../isURL.js";
import {expect} from "chai";

describe("isURL", function () {
    it("detects an URL in an incoming string", function () {
        const incomingString = "https://test.example.com";

        expect(isURL(incomingString)).to.be.true;
    });
    it("detects an URL in an incoming string", function () {
        const incomingString = "http://test.example.com";

        expect(isURL(incomingString)).to.be.true;
    });
    it("detects an HTML file in an incoming string", function () {
        const incomingString = "test.example.com/index.html";

        expect(isURL(incomingString)).to.be.true;
    });
    it("detects that an incoming string is not an URL or HTML file", function () {
        const incomingString = "test@mail.com";

        expect(isURL(incomingString)).to.be.false;
    });
    it("detects that an incoming string is not an URL or HTML file", function () {
        const incomingString = "089 / 1234567";

        expect(isURL(incomingString)).to.be.false;
    });
});

