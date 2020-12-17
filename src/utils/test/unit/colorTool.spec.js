import {
    convertColor,
    isRgbArray,
    convertRgbArrayToHexColor,
    isRgbString,
    convertRgbStringToHexColor,
    isHexColorString,
    convertHexColorStringToRgbArray
} from "../../colorTools.js";
import {expect} from "chai";

describe("src/utils/colorTools.js", () => {
    describe("isRgbArray", () => {
        it("should return false if the given array is anything but an array of 3 or more numbers", () => {
            expect(isRgbArray(undefined)).to.be.false;
            expect(isRgbArray(null)).to.be.false;
            expect(isRgbArray("string")).to.be.false;
            expect(isRgbArray(1234)).to.be.false;
            expect(isRgbArray([1, 2])).to.be.false;
            expect(isRgbArray({})).to.be.false;
        });
        it("should return false if the given array is an array of 3 or more numbers, but any numbers are out of range", () => {
            expect(isRgbArray([-1, 0, 0])).to.be.false;
            expect(isRgbArray([0, -1, 0])).to.be.false;
            expect(isRgbArray([0, 0, -1])).to.be.false;
            expect(isRgbArray([256, 0, 0])).to.be.false;
            expect(isRgbArray([0, 256, 0])).to.be.false;
            expect(isRgbArray([0, 0, 256])).to.be.false;
        });
        it("should return false if the given alpha is out of range", () => {
            expect(isRgbArray([0, 0, 0, -0.0001])).to.be.false;
            expect(isRgbArray([0, 0, 0, 1.0001])).to.be.false;
        });
        it("should return true if the given array is an array of 3 or more numbers in a recognizable range", () => {
            expect(isRgbArray([0, 0, 0])).to.be.true;
            expect(isRgbArray([255, 255, 255])).to.be.true;
            expect(isRgbArray([0, 0, 0, 0])).to.be.true;
            expect(isRgbArray([255, 255, 255, 1])).to.be.true;
        });
    });
    describe("convertRgbArrayToHexColor", () => {
        it("should return hex black if the given color is not an array", () => {
            expect(convertRgbArrayToHexColor(undefined)).to.equal("#000000");
            expect(convertRgbArrayToHexColor(null)).to.equal("#000000");
            expect(convertRgbArrayToHexColor("string")).to.equal("#000000");
            expect(convertRgbArrayToHexColor(1234)).to.equal("#000000");
            expect(convertRgbArrayToHexColor({})).to.equal("#000000");
        });
        it("should convert an array as if it is a rgb array without validation", () => {
            expect(convertRgbArrayToHexColor([])).to.equal("#NaNNaNNaN");
            expect(convertRgbArrayToHexColor([null, null, null])).to.equal("#NaNNaNNaN");
            expect(convertRgbArrayToHexColor(["fff", "fff", "fff"])).to.equal("#NaNNaNNaN");
            expect(convertRgbArrayToHexColor([256, 256, 256])).to.equal("#100100100");
        });
        it("should convert a rgb array to the html hex color", () => {
            expect(convertRgbArrayToHexColor([0, 0, 0])).to.equal("#000000");
            expect(convertRgbArrayToHexColor([255, 255, 255])).to.equal("#ffffff");
            expect(convertRgbArrayToHexColor([0, 0, 0, 0])).to.equal("#000000");
            expect(convertRgbArrayToHexColor([255, 255, 255, 1])).to.equal("#ffffff");
        });
    });
    describe("isRgbString", () => {
        it("should return false if the given color is anything but a string with brackets", () => {
            expect(isRgbString(undefined)).to.be.false;
            expect(isRgbString(null)).to.be.false;
            expect(isRgbString("string")).to.be.false;
            expect(isRgbString(1234)).to.be.false;
            expect(isRgbString([])).to.be.false;
            expect(isRgbString({})).to.be.false;
        });
        it("should return false if the given color is anything but a string with brackets and valid rgb numbers", () => {
            expect(isRgbString("[-1, 0, 0]")).to.be.false;
            expect(isRgbString("[0, -1, 0]")).to.be.false;
            expect(isRgbString("[0, 0, -1]")).to.be.false;
            expect(isRgbString("[0, 0, 0, -0.0001]")).to.be.false;
            expect(isRgbString("[256, 0, 0]")).to.be.false;
            expect(isRgbString("[0, 256, 0]")).to.be.false;
            expect(isRgbString("[0, 0, 256]")).to.be.false;
            expect(isRgbString("[0, 0, 0, 1.0001]")).to.be.false;
        });
        it("should recognize a string within brackets as rgb array", () => {
            expect(isRgbString("[0, 0, 0]")).to.be.true;
            expect(isRgbString("[255, 255, 255]")).to.be.true;
            expect(isRgbString("[0, 0, 0, 0]")).to.be.true;
            expect(isRgbString("[255, 255, 255, 1]")).to.be.true;
        });
    });
    describe("convertRgbStringToHexColor", () => {
        it("should return hex black if the given color is not a rgb string", () => {
            expect(convertRgbStringToHexColor(undefined)).to.equal("#000000");
            expect(convertRgbStringToHexColor(null)).to.equal("#000000");
            expect(convertRgbStringToHexColor(1234)).to.equal("#000000");
            expect(convertRgbStringToHexColor({})).to.equal("#000000");
        });
        it("should convert to an array as if the given string is a valid rgb string", () => {
            expect(convertRgbStringToHexColor("string")).to.equal("#NaNNaNNaN");
            expect(convertRgbStringToHexColor("[]")).to.equal("#NaNNaNNaN");
            expect(convertRgbStringToHexColor("[null, null, null]")).to.equal("#NaNNaNNaN");
            expect(convertRgbStringToHexColor("[fff, fff, fff]")).to.equal("#NaNNaNNaN");
            expect(convertRgbStringToHexColor("[256, 256, 256]")).to.equal("#100100100");
        });
        it("should convert a rgb array to the html hex color", () => {
            expect(convertRgbStringToHexColor("[0, 0, 0]")).to.equal("#000000");
            expect(convertRgbStringToHexColor("[255, 255, 255]")).to.equal("#ffffff");
            expect(convertRgbStringToHexColor("[0, 0, 0, 0]")).to.equal("#000000");
            expect(convertRgbStringToHexColor("[255, 255, 255, 1]")).to.equal("#ffffff");
        });
    });
    describe("isHexColorString", () => {
        it("should return false if the given value is anything but a valid hex color string", () => {
            expect(isHexColorString(undefined)).to.be.false;
            expect(isHexColorString(null)).to.be.false;
            expect(isHexColorString("string")).to.be.false;
            expect(isHexColorString(12345)).to.be.false;
            expect(isHexColorString([])).to.be.false;
            expect(isHexColorString({})).to.be.false;
        });
        it("should return false if the given string is not a valid hex color string", () => {
            expect(isHexColorString("#")).to.be.false;
            expect(isHexColorString("#0")).to.be.false;
            expect(isHexColorString("#00")).to.be.false;
            expect(isHexColorString("#0000")).to.be.false;
            expect(isHexColorString("#00000")).to.be.false;
            expect(isHexColorString("#0000000")).to.be.false;
            expect(isHexColorString("#ggggggg")).to.be.false;
        });
        it("should return true if the given string is a valid hex color string", () => {
            expect(isHexColorString("#000")).to.be.true;
            expect(isHexColorString("#fff")).to.be.true;
            expect(isHexColorString("#000000")).to.be.true;
            expect(isHexColorString("#ffffff")).to.be.true;
        });
    });
    describe("convertHexColorStringToRgbArray", () => {
        it("should return rgb black (alpha 1) if the given value is anything but a string", () => {
            expect(convertHexColorStringToRgbArray(undefined)).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray(null)).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("string")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray(12345)).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray({})).to.deep.equal([0, 0, 0, 1]);
        });
        it("should return rgb black (alpha 1) if the length of the given string is anything but 4 or 7", () => {
            expect(convertHexColorStringToRgbArray("#")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#f")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#ff")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#ffff")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#fffff")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#fffffff")).to.deep.equal([0, 0, 0, 1]);
        });
        it("should return the given valid hex string as a rgb array", () => {
            expect(convertHexColorStringToRgbArray("#000000")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#ffffff")).to.deep.equal([255, 255, 255, 1]);
            expect(convertHexColorStringToRgbArray("#000")).to.deep.equal([0, 0, 0, 1]);
            expect(convertHexColorStringToRgbArray("#fff")).to.deep.equal([255, 255, 255, 1]);
        });
    });
    describe("convertColor", () => {
        it("should return the given value if the given value is not recognized as any form of color", () => {
            expect(convertColor(undefined)).to.be.undefined;
            expect(convertColor(null)).to.be.null;
            expect(convertColor("string")).to.equal("string");
            expect(convertColor(1234)).to.equal(1234);
            expect(convertColor([])).to.be.an("array").to.be.empty;
            expect(convertColor({})).to.be.an("object").to.be.empty;
        });
        it("should return the given color if no dest is given", () => {
            expect(convertColor("#ffffff")).to.equal("#ffffff");
            expect(convertColor([255, 255, 255, 1])).to.deep.equal([255, 255, 255, 1]);
        });
        it("should return the rgb color as rgb color if a rgb color and dest rgb is given", () => {
            expect(convertColor([255, 255, 255, 1], "rgb")).to.deep.equal([255, 255, 255, 1]);
        });
        it("should return the hex color as hex color if a hex color and dest hex is given", () => {
            expect(convertColor("#ffffff", "hex")).to.equal("#ffffff");
        });
        it("should return the rgb color as hex color if a rgb color and dest hex is given", () => {
            expect(convertColor([255, 255, 255, 1], "hex")).to.equal("#ffffff");
        });
        it("should return the hex color as rgb color if a hex color and dest rgb is given", () => {
            expect(convertColor("#ffffff", "rgb")).to.deep.equal([255, 255, 255, 1]);
        });
    });
});
