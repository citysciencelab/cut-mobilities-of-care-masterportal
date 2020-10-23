import {Style} from "ol/style.js";
import {expect} from "chai";
import {createTextStyle} from "../../../../utils/style/createTextStyle";

describe("src/modules/tools/draw/utils/style/createTextStyle.js", () => {
    describe("createTextStyle", () => {
        it("the result should be an instance of Style for empty input", () => {
            const color = [],
                font = "",
                fontSize = 0,
                text = "",
                zIndex = 0,
                result = createTextStyle(color, font, fontSize, text, zIndex);

            expect(result instanceof Style).to.be.true;
        });
        it("the result fontSize should be the same as the input fontSize", () => {
            const color = [255, 255, 0, 1],
                font = "Arial",
                fontSize = 10,
                text = "",
                zIndex = 0,
                result = createTextStyle(color, font, fontSize, text, zIndex);

            expect(result.getText().getFont()).to.equal("10px Arial");
        });
        it("the result should be an instance of Style for undefined input", () => {
            expect(createTextStyle(undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
    });
});
