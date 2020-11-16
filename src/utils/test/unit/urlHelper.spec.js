import {expect} from "chai";
import {isUrl, isWebLink} from "../../urlHelper.js";

describe("src/utils/urlHelper.js", () => {
    it("detects an URL in an incoming string", () => {
        const incomingString = "https://test.example.com";

        expect(isUrl(incomingString)).to.be.true;
    });
    it("detects an URL in an incoming string", () => {
        const incomingString = "http://test.example.com";

        expect(isUrl(incomingString)).to.be.true;
    });
    it("detects an HTML file in an incoming string", () => {
        const incomingString = "test.example.com/index.html";

        expect(isUrl(incomingString)).to.be.true;
    });
    it("detects that an incoming string is not an URL or HTML file", () => {
        const incomingString = "test@mail.com";

        expect(isUrl(incomingString)).to.be.false;
    });
    it("detects that an incoming string is not an URL or HTML file", () => {
        const incomingString = "089 / 1234567";

        expect(isUrl(incomingString)).to.be.false;
    });

    describe("isWebLink", () => {
        it("should return a boolean false no matter what kind of input is given (except for links)", () => {
            expect(isWebLink(undefined)).to.be.false;
            expect(isWebLink(null)).to.be.false;
            expect(isWebLink(1234)).to.be.false;
            expect(isWebLink("string")).to.be.false;
            expect(isWebLink({})).to.be.false;
            expect(isWebLink([])).to.be.false;
            expect(isWebLink(false)).to.be.false;
            expect(isWebLink(true)).to.be.false;
        });

        it("should respond to a string beginning with http:// with boolean true", () => {
            expect(isWebLink("http://")).to.be.true;
        });
        it("should respond to a string with uppercase http:// with boolean true", () => {
            expect(isWebLink("HTTP://")).to.be.true;
        });
        it("should not recognize a link within a string", () => {
            expect(isWebLink("stringhttp://string")).to.be.false;
        });

        it("should respond to a string beginning with https:// with boolean true", () => {
            expect(isWebLink("https://")).to.be.true;
        });
        it("should respond to a string beginning with ftp:// with boolean true", () => {
            expect(isWebLink("ftp://")).to.be.true;
        });
        it("should respond to a string beginning with ftp:// with boolean true", () => {
            expect(isWebLink("sftp://")).to.be.true;
        });
        it("should respond to a string beginning with file:// with boolean true", () => {
            expect(isWebLink("file://")).to.be.true;
        });
        it("should respond to a string beginning with // with boolean true", () => {
            expect(isWebLink("//")).to.be.true;
        });
    });
});
