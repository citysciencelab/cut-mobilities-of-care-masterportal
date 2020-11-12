import colorToRgb from "../../colorToRgb.js";
import {expect} from "chai";


describe("colorToRgb", () => {
    it("transforms a color array into a rgb-color string or returns black", () => {
        expect(colorToRgb(undefined)).to.be.equals("rgb(0,0,0)");
        expect(colorToRgb(null)).to.be.equals("rgb(0,0,0)");
        expect(colorToRgb([])).to.be.equals("rgb(0,0,0)");
        expect(colorToRgb([1, 2, 3])).to.be.equals("rgb(1,2,3)");
        expect(colorToRgb([1, 2, 3, 0.5])).to.be.equals("rgb(1,2,3)");
    });
});
