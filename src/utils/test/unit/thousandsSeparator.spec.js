import thousandsSeparator from "../../thousandsSeparator.js";
import {expect} from "chai";

describe("src/utils/thousandsSeparator.js", () => {
    it("should return an empty string if the given param is not a number nor a string", () => {
        expect(thousandsSeparator(undefined)).to.be.a("string").and.to.be.empty;
        expect(thousandsSeparator(null)).to.be.a("string").and.to.be.empty;
        expect(thousandsSeparator([])).to.be.a("string").and.to.be.empty;
        expect(thousandsSeparator({})).to.be.a("string").and.to.be.empty;
        expect(thousandsSeparator(false)).to.be.a("string").and.to.be.empty;
        expect(thousandsSeparator(true)).to.be.a("string").and.to.be.empty;
    });
    it("should convert a number into a string", () => {
        expect(thousandsSeparator(1)).to.be.a("string");
    });
    it("should convert a negative number into a string", () => {
        expect(thousandsSeparator(-1)).to.be.a("string");
    });
    it("should return a string if a string was given", () => {
        expect(thousandsSeparator("1")).to.be.a("string");
    });
    it("should add the given letter(s) as thousands separator", () => {
        expect(thousandsSeparator(1000, "delimAbs")).to.equal("1delimAbs000");
    });
    it("should add the given letter(s) as decimal point", () => {
        expect(thousandsSeparator(1000.1, "delimAbs", "delimDec")).to.equal("1delimAbs000delimDec1");
    });
    it("should create a number in german format by default", () => {
        expect(thousandsSeparator(1000.1)).to.equal("1.000,1");
    });
    it("should be able to add a higher number of thousands separators", () => {
        expect(thousandsSeparator(1123456789.123456)).to.equal("1.123.456.789,123456");
    });
    it("should be able to add a higher number of thousands separators if a string was given", () => {
        expect(thousandsSeparator("1123456789.123456")).to.equal("1.123.456.789,123456");
    });
    it("should add the given letter(s) as thousands seperator", () => {
        expect(thousandsSeparator(-1000, "delimAbs")).to.equal("-1delimAbs000");
    });
    it("should add the given letter(s) as decimal point", () => {
        expect(thousandsSeparator(-1000.1, "delimAbs", "delimDec")).to.equal("-1delimAbs000delimDec1");
    });
    it("should create a number in german format by default", () => {
        expect(thousandsSeparator(-1000.1)).to.equal("-1.000,1");
    });
    it("should be able to add a higher number of thousands seperators", () => {
        expect(thousandsSeparator(-1123456789.123456)).to.equal("-1.123.456.789,123456");
    });
    it("should be able to add a higher number of thousands seperators if a string was given", () => {
        expect(thousandsSeparator("-1123456789.123456")).to.equal("-1.123.456.789,123456");
    });
});

