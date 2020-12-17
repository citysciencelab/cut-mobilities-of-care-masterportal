import {expect} from "chai";
import Model from "@modules/vectorStyle/linestringStyle";
import {Style, Stroke} from "ol/style.js";

describe("linestringStyleModel", function () {
    let styleModel;

    before(function () {
        styleModel = new Model();
    });

    describe("getStyle", function () {
        it("should return a style object", function () {
            expect(styleModel.getStyle()).to.be.an.instanceof(Style);
        });
        it("should return a style object that includes a stroke", function () {
            expect(styleModel.getStyle().getStroke()).to.be.an.instanceof(Stroke);
        });
    });

    describe("normalizeRgbColor", function () {
        it("should be extend the given array with length 3 by value 1", function () {
            expect(styleModel.normalizeRgbColor([255, 255, 255])).to.be.an("array").to.include.ordered.members([255, 255, 255, 1]);
        });
        it("should be extend the given array with length 2 by value 1, 1", function () {
            expect(styleModel.normalizeRgbColor([255, 255])).to.be.an("array").to.include.ordered.members([255, 255, 1, 1]);
        });
        it("should be return the input value, which is an array with length 4", function () {
            expect(styleModel.normalizeRgbColor([0, 0, 0, 0])).to.be.an("array").to.include.ordered.members([0, 0, 0, 0]);
        });
        it("should be return the input value, which is an array with length > 4", function () {
            expect(styleModel.normalizeRgbColor([1, 2, 3, 4, 5])).to.be.an("array").to.include.ordered.members([1, 2, 3, 4]);
        });
    });

    describe("componentToHex", function () {
        it("should return the parsed 16 digits value", function () {
            expect(styleModel.componentToHex(2)).to.equal("02");
            expect(styleModel.componentToHex(213)).to.equal("d5");
        });
    });

    describe("rgbToHex", function () {
        it("should return the parsed hex value", function () {
            expect(styleModel.rgbToHex(2, 213, 33)).to.equal("#02d521");
        });
    });

    describe("hexToRgb", function () {
        it("should return the parsed rgb value", function () {
            expect(styleModel.hexToRgb("#020521")).to.deep.equal([2, 5, 21]);
        });
        it("should return null", function () {
            expect(styleModel.hexToRgb("")).to.equal(null);
        });
    });
});
