import {Style} from "ol/style.js";
import {expect} from "chai";
import {createStyle} from "../../../utils/style/createStyle";

describe("src/modules/tools/draw/utils/style/createStyle.js", () => {
    let iconPath;

    before(() => {
        iconPath = "/test/unittests/resources/icons/";
    });

    describe("createStyle", () => {
        let color = [55, 126, 184, 1];

        it("the result should be an instance of Style for undefined input", () => {
            const result = createStyle({
                color: undefined,
                colorContour: undefined,
                drawType: {id: undefined, geometry: undefined},
                pointSize: undefined,
                strokeWidth: undefined,
                symbol: {type: undefined},
                zIndex: undefined
            });

            expect(result instanceof Style).to.be.true;
        });
        it("the result color should be the same as the input color for a polyline", () => {
            const drawType = {value: "LineString", id: "drawLine"},
                symbol = {type: undefined};

            expect(createStyle({color, drawType, symbol}).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as the input color for a polygon", () => {
            const drawType = {value: "Polygon", id: "drawArea"},
                symbol = {type: undefined};

            expect(createStyle({color, drawType, symbol}).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as the input color for a point of type glyphicon", () => {
            const symbol = {type: "glyphicon", value: "\ue103"},
                drawType = {value: "Point", id: "drawSymbol"};

            expect(createStyle({color, drawType, symbol}).getText().getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as input color excluding the opacity which should be set as a separate parameter for a point of type image", () => {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const symbol = {type: "image", value: iconPath + "cloud.png"},
                drawType = {value: "Point", id: "drawSymbol"},
                result = createStyle({color, drawType, symbol}).getImage();

            expect(result.getOpacity()).to.deep.equal(color[3]);
        });
        it("the result color should be the same as the input color for text", () => {
            const drawType = {value: "Point", id: "writeText"},
                symbol = {type: undefined};

            color = [255, 0, 0, 1];

            expect(createStyle({color, drawType, symbol}).getText().getFill().getColor()).to.deep.equal(color);
        });
    });
});
