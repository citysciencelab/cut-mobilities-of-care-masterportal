import colorArrayToRgb from "../../colorArrayToRgb.js";
import {expect} from "chai";


describe("colorArrayToRgb", () => {
    it("transforms a color array into a rgb-color string or returns black", () => {
        expect(colorArrayToRgb(undefined)).to.be.equals("rgb(0, 0, 0)");
        expect(colorArrayToRgb(null)).to.be.equals("rgb(0, 0, 0)");
        expect(colorArrayToRgb([])).to.be.equals("rgb(0, 0, 0)");
        expect(colorArrayToRgb([1, 2, 3])).to.be.equals("rgb(1, 2, 3)");
        expect(colorArrayToRgb([1, 2, 3, 0.5])).to.be.equals("rgb(1, 2, 3)");
    });
});
