import {expect} from "chai";
import {
    convertColor,
    isRgbArray,
    isRgbaArray,
    isHexColorString,
    isCssColorString,
    isRgbArrayString,
    isRgbaArrayString,
    isRgbColorString,
    isRgbaColorString,
    parseHexColorString,
    parseCssColorString,
    parseRgbColorString,
    parseRgbaColorString,
    convertToHexColor,
    convertToRgbArrayString,
    convertToRgbaArrayString,
    convertToRgbString,
    convertToRgbaString
} from "../../convertColor.js";

describe("src/utils/convertColor.js", () => {
    describe("isRgbArray", () => {
        it("should return false if the given array is anything but an array of 3 numbers", () => {
            expect(isRgbArray(undefined)).to.be.false;
            expect(isRgbArray(null)).to.be.false;
            expect(isRgbArray("string")).to.be.false;
            expect(isRgbArray(1234)).to.be.false;
            expect(isRgbArray([1, 2])).to.be.false;
            expect(isRgbArray({})).to.be.false;
        });
        it("should return false if any number is out of range", () => {
            expect(isRgbArray([-1, 0, 0])).to.be.false;
            expect(isRgbArray([0, -1, 0])).to.be.false;
            expect(isRgbArray([0, 0, -1])).to.be.false;
            expect(isRgbArray([256, 0, 0])).to.be.false;
            expect(isRgbArray([0, 256, 0])).to.be.false;
            expect(isRgbArray([0, 0, 256])).to.be.false;
        });
        it("should return true if the given array is an array of 3 numbers in a recognizable range", () => {
            expect(isRgbArray([0, 0, 0])).to.be.true;
            expect(isRgbArray([255, 255, 255])).to.be.true;
        });
    });

    describe("isRgbaArray", () => {
        it("should return false if the given array is anything but an array of 3 numbers", () => {
            expect(isRgbaArray(undefined)).to.be.false;
            expect(isRgbaArray(null)).to.be.false;
            expect(isRgbaArray("string")).to.be.false;
            expect(isRgbaArray(1234)).to.be.false;
            expect(isRgbaArray([1, 2])).to.be.false;
            expect(isRgbaArray({})).to.be.false;
        });
        it("should return false if any number is out of range", () => {
            expect(isRgbaArray([-1, 0, 0, 1])).to.be.false;
            expect(isRgbaArray([0, -1, 0, 1])).to.be.false;
            expect(isRgbaArray([0, 0, -1, 1])).to.be.false;
            expect(isRgbaArray([256, 0, 0, 1])).to.be.false;
            expect(isRgbaArray([0, 256, 0, 1])).to.be.false;
            expect(isRgbaArray([0, 0, 256, 1])).to.be.false;
        });
        it("should return false if the given alpha is out of range", () => {
            expect(isRgbaArray([0, 0, 0, -0.0001])).to.be.false;
            expect(isRgbaArray([0, 0, 0, 1.0001])).to.be.false;
        });
        it("should return true if the given array is an array of 3 or more numbers in a recognizable range", () => {
            expect(isRgbaArray([0, 0, 0, 0])).to.be.true;
            expect(isRgbaArray([255, 255, 255, 1])).to.be.true;
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

    describe("isCssColorString", () => {
        it("should return false if the given value is anything but a string", () => {
            expect(isCssColorString(undefined)).to.be.false;
            expect(isCssColorString(null)).to.be.false;
            expect(isCssColorString(12345)).to.be.false;
            expect(isCssColorString([])).to.be.false;
            expect(isCssColorString({})).to.be.false;
        });
        it("should return false if the given string is not a valid css color string", () => {
            expect(isCssColorString("string")).to.be.false;
            expect(isCssColorString("#000000")).to.be.false;
        });
        it("should return true if the given string is a valid css color string", () => {
            expect(isCssColorString("black")).to.be.true;
            expect(isCssColorString("WHITE")).to.be.true;
            expect(isCssColorString("MediumAquamarine")).to.be.true;
            expect(isCssColorString("navajowhite")).to.be.true;
        });
    });

    describe("isRgbArrayString", () => {
        it("should return false if the given color is anything but a string with brackets", () => {
            expect(isRgbArrayString(undefined)).to.be.false;
            expect(isRgbArrayString(null)).to.be.false;
            expect(isRgbArrayString("string")).to.be.false;
            expect(isRgbArrayString(1234)).to.be.false;
            expect(isRgbArrayString([])).to.be.false;
            expect(isRgbArrayString({})).to.be.false;
        });
        it("should return false if the given color is anything but a string with brackets and valid rgb numbers", () => {
            expect(isRgbArrayString("[-1, 0, 0]")).to.be.false;
            expect(isRgbArrayString("[0, -1, 0]")).to.be.false;
            expect(isRgbArrayString("[0, 0, -1]")).to.be.false;
            expect(isRgbArrayString("[256, 0, 0]")).to.be.false;
            expect(isRgbArrayString("[0, 256, 0]")).to.be.false;
            expect(isRgbArrayString("[0, 0, 256]")).to.be.false;
        });
        it("should recognize a string within brackets as rgb array", () => {
            expect(isRgbArrayString("[0, 0, 0]")).to.be.true;
            expect(isRgbArrayString("[255, 255, 255]")).to.be.true;
        });
    });

    describe("isRgbaArrayString", () => {
        it("should return false if the given color is anything but a string with brackets", () => {
            expect(isRgbaArrayString(undefined)).to.be.false;
            expect(isRgbaArrayString(null)).to.be.false;
            expect(isRgbaArrayString("string")).to.be.false;
            expect(isRgbaArrayString(1234)).to.be.false;
            expect(isRgbaArrayString([])).to.be.false;
            expect(isRgbaArrayString({})).to.be.false;
        });
        it("should return false if the given color is anything but a string with brackets and valid rgba numbers", () => {
            expect(isRgbaArrayString("[-1, 0, 0, 1]")).to.be.false;
            expect(isRgbaArrayString("[0, -1, 0, 1]")).to.be.false;
            expect(isRgbaArrayString("[0, 0, -1, 1]")).to.be.false;
            expect(isRgbaArrayString("[0, 0, 0, -0.0001]")).to.be.false;
            expect(isRgbaArrayString("[256, 0, 0, 1]")).to.be.false;
            expect(isRgbaArrayString("[0, 256, 0, 1]")).to.be.false;
            expect(isRgbaArrayString("[0, 0, 256, 1]")).to.be.false;
            expect(isRgbaArrayString("[0, 0, 0, 1.0001]")).to.be.false;
        });
        it("should recognize a string within brackets as rgba array", () => {
            expect(isRgbaArrayString("[0, 0, 0, 0]")).to.be.true;
            expect(isRgbaArrayString("[255, 255, 255, 1]")).to.be.true;
        });
    });

    describe("isRgbColorString", () => {
        it("should return false if the given color is anything but a string", () => {
            expect(isRgbColorString(undefined)).to.be.false;
            expect(isRgbColorString(null)).to.be.false;
            expect(isRgbColorString(1234)).to.be.false;
            expect(isRgbColorString([])).to.be.false;
            expect(isRgbColorString({})).to.be.false;
        });
        it("should return false if the given color is anything but a valid rgb color string", () => {
            expect(isRgbColorString("rgb(-1, 0, 0)")).to.be.false;
            expect(isRgbColorString("rgb(0, -1, 0)")).to.be.false;
            expect(isRgbColorString("rgb(0, 0, -1)")).to.be.false;
            expect(isRgbColorString("rgb(256, 0, 0)")).to.be.false;
            expect(isRgbColorString("rgb(0, 256, 0)")).to.be.false;
            expect(isRgbColorString("rgb(0, 0, 256)")).to.be.false;
        });
        it("should recognize a string within brackets as valid rgb color string", () => {
            expect(isRgbColorString("rgb(0, 0, 0)")).to.be.true;
            expect(isRgbColorString("rgb(255, 255, 255)")).to.be.true;
        });
    });

    describe("isRgbaColorString", () => {
        it("should return false if the given color is anything but a string", () => {
            expect(isRgbaColorString(undefined)).to.be.false;
            expect(isRgbaColorString(null)).to.be.false;
            expect(isRgbaColorString(1234)).to.be.false;
            expect(isRgbaColorString([])).to.be.false;
            expect(isRgbaColorString({})).to.be.false;
        });
        it("should return false if the given color is anything but a valid rgba color string", () => {
            expect(isRgbaColorString("rgba(-1, 0, 0, 1)")).to.be.false;
            expect(isRgbaColorString("rgba(0, -1, 0, 1)")).to.be.false;
            expect(isRgbaColorString("rgba(0, 0, -1, 1)")).to.be.false;
            expect(isRgbaColorString("rgba(0, 0, 0, -0.0001)")).to.be.false;
            expect(isRgbaColorString("rgba(256, 0, 0, 1)")).to.be.false;
            expect(isRgbaColorString("rgba(0, 256, 0, 1)")).to.be.false;
            expect(isRgbaColorString("rgba(0, 0, 256, 1)")).to.be.false;
            expect(isRgbaColorString("rgba(0, 0, 0, 1.0001)")).to.be.false;
        });
        it("should recognize a string within brackets as valid rgb color string", () => {
            expect(isRgbaColorString("rgba(0, 0, 0, 0)")).to.be.true;
            expect(isRgbaColorString("rgba(255, 255, 255, 1)")).to.be.true;
        });
    });

    describe("parseHexColorString", () => {
        it("should return an rgba array if a valid hex color string is given", () => {
            expect(parseHexColorString("#000000")).to.deep.equal([0, 0, 0, 1]);
            expect(parseHexColorString("#ffffff")).to.deep.equal([255, 255, 255, 1]);
            expect(parseHexColorString("#000")).to.deep.equal([0, 0, 0, 1]);
            expect(parseHexColorString("#fff")).to.deep.equal([255, 255, 255, 1]);
        });
    });
    describe("parseCssColorString", () => {
        it("should return an rgba array if a valid css color string is given", () => {
            expect(parseCssColorString("black")).to.deep.equal([0, 0, 0, 1]);
            expect(parseCssColorString("WHITE")).to.deep.equal([255, 255, 255, 1]);
            expect(parseCssColorString("PaleGoldenRod")).to.deep.equal([238, 232, 170, 1]);
            expect(parseCssColorString("seashell")).to.deep.equal([255, 245, 238, 1]);
        });
    });
    describe("parseRgbColorString", () => {
        it("should return an rgba array if a valid rgb color string is given", () => {
            expect(parseRgbColorString("rgb(0, 0, 0)")).to.deep.equal([0, 0, 0, 1]);
            expect(parseRgbColorString("rgb(255, 255, 255)")).to.deep.equal([255, 255, 255, 1]);
        });
    });
    describe("parseRgbaColorString", () => {
        it("should return an rgba array if a valid rgba color string is given", () => {
            expect(parseRgbaColorString("rgba(0, 0, 0, 0)")).to.deep.equal([0, 0, 0, 0]);
            expect(parseRgbaColorString("rgba(255, 255, 255, 1)")).to.deep.equal([255, 255, 255, 1]);
        });
    });

    describe("convertToHexColor", () => {
        it("should convert a valid rgba array into a hex color string", () => {
            expect(convertToHexColor([0, 0, 0, 0])).to.equal("#000000");
            expect(convertToHexColor([255, 255, 255, 1])).to.equal("#ffffff");
        });
    });
    describe("convertToRgbArrayString", () => {
        it("should convert a valid rgba array into a hex color string", () => {
            expect(convertToRgbArrayString([0, 0, 0, 0])).to.equal("[0, 0, 0]");
            expect(convertToRgbArrayString([255, 255, 255, 1])).to.equal("[255, 255, 255]");
        });
    });
    describe("convertToRgbaArrayString", () => {
        it("should convert a valid rgba array into a hex color string", () => {
            expect(convertToRgbaArrayString([0, 0, 0, 0])).to.equal("[0, 0, 0, 0]");
            expect(convertToRgbaArrayString([255, 255, 255, 1])).to.equal("[255, 255, 255, 1]");
        });
    });
    describe("convertToRgbString", () => {
        it("should convert a valid rgba array into a hex color string", () => {
            expect(convertToRgbString([0, 0, 0, 0])).to.equal("rgb(0, 0, 0)");
            expect(convertToRgbString([255, 255, 255, 1])).to.equal("rgb(255, 255, 255)");
        });
    });
    describe("convertToRgbaString", () => {
        it("should convert a valid rgba array into a hex color string", () => {
            expect(convertToRgbaString([0, 0, 0, 0])).to.equal("rgba(0, 0, 0, 0)");
            expect(convertToRgbaString([255, 255, 255, 1])).to.equal("rgba(255, 255, 255, 1)");
        });
    });

    describe("convertColor", () => {
        it("should return rgba black if no destination is given and the given value is not recognized as any form of color", () => {
            expect(convertColor(undefined)).to.deep.equal([0, 0, 0, 1]);
            expect(convertColor(null)).to.deep.equal([0, 0, 0, 1]);
            expect(convertColor("string")).to.deep.equal([0, 0, 0, 1]);
            expect(convertColor(1234)).to.deep.equal([0, 0, 0, 1]);
            expect(convertColor([])).to.deep.equal([0, 0, 0, 1]);
            expect(convertColor({})).to.deep.equal([0, 0, 0, 1]);
        });
        it("should convert any form of color into an rgba array if no destination is given", () => {
            expect(convertColor([255, 255, 255])).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor([255, 255, 255, 1])).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("#ffffff")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("white")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("[255, 255, 255]")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("[255, 255, 255, 1]")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("rgb(255, 255, 255)")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("rgba(255, 255, 255, 1)")).to.deep.equal([255, 255, 255, 1]);
        });
        it("should convert any form of color into an rgba array if the destination is 'rgba'", () => {
            expect(convertColor([255, 255, 255], "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor([255, 255, 255, 1], "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("#ffffff", "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("white", "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("[255, 255, 255]", "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("[255, 255, 255, 1]", "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("rgb(255, 255, 255)", "rgba")).to.deep.equal([255, 255, 255, 1]);
            expect(convertColor("rgba(255, 255, 255, 1)", "rgba")).to.deep.equal([255, 255, 255, 1]);
        });
        it("should convert any form of color into an rgb array if the destination is 'rgb'", () => {
            expect(convertColor([255, 255, 255], "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor([255, 255, 255, 1], "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor("#ffffff", "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor("white", "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor("[255, 255, 255]", "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor("[255, 255, 255, 1]", "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor("rgb(255, 255, 255)", "rgb")).to.deep.equal([255, 255, 255]);
            expect(convertColor("rgba(255, 255, 255, 1)", "rgb")).to.deep.equal([255, 255, 255]);
        });
        it("should convert any form of color into a hex color string if the destination is 'hex'", () => {
            expect(convertColor([255, 255, 255], "hex")).to.deep.equal("#ffffff");
            expect(convertColor([255, 255, 255, 1], "hex")).to.deep.equal("#ffffff");
            expect(convertColor("#ffffff", "hex")).to.deep.equal("#ffffff");
            expect(convertColor("white", "hex")).to.deep.equal("#ffffff");
            expect(convertColor("[255, 255, 255]", "hex")).to.deep.equal("#ffffff");
            expect(convertColor("[255, 255, 255, 1]", "hex")).to.deep.equal("#ffffff");
            expect(convertColor("rgb(255, 255, 255)", "hex")).to.deep.equal("#ffffff");
            expect(convertColor("rgba(255, 255, 255, 1)", "hex")).to.deep.equal("#ffffff");
        });
        it("should convert any form of color into an rgb array string if the destination is 'rgbArrayString'", () => {
            expect(convertColor([255, 255, 255], "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor([255, 255, 255, 1], "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor("#ffffff", "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor("white", "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor("[255, 255, 255]", "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor("[255, 255, 255, 1]", "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor("rgb(255, 255, 255)", "rgbArrayString")).to.deep.equal("[255, 255, 255]");
            expect(convertColor("rgba(255, 255, 255, 1)", "rgbArrayString")).to.deep.equal("[255, 255, 255]");
        });
        it("should convert any form of color into an rgba array string if the destination is 'rgbaArrayString'", () => {
            expect(convertColor([255, 255, 255], "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor([255, 255, 255, 1], "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor("#ffffff", "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor("white", "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor("[255, 255, 255]", "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor("[255, 255, 255, 1]", "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor("rgb(255, 255, 255)", "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
            expect(convertColor("rgba(255, 255, 255, 1)", "rgbaArrayString")).to.deep.equal("[255, 255, 255, 1]");
        });
        it("should convert any form of color into an rgb string if the destination is 'rgbString'", () => {
            expect(convertColor([255, 255, 255], "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor([255, 255, 255, 1], "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor("#ffffff", "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor("white", "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor("[255, 255, 255]", "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor("[255, 255, 255, 1]", "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor("rgb(255, 255, 255)", "rgbString")).to.deep.equal("rgb(255, 255, 255)");
            expect(convertColor("rgba(255, 255, 255, 1)", "rgbString")).to.deep.equal("rgb(255, 255, 255)");
        });
        it("should convert any form of color into an rgb string if the destination is 'rgbaString'", () => {
            expect(convertColor([255, 255, 255], "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor([255, 255, 255, 1], "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor("#ffffff", "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor("white", "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor("[255, 255, 255]", "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor("[255, 255, 255, 1]", "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor("rgb(255, 255, 255)", "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
            expect(convertColor("rgba(255, 255, 255, 1)", "rgbaString")).to.deep.equal("rgba(255, 255, 255, 1)");
        });
    });
});
