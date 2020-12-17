import {Style} from "ol/style.js";
import {expect} from "chai";
import {createStyle} from "../../../../utils/style/createStyle";

describe("src/modules/tools/draw/utils/style/createStyle.js", () => {
    let iconPath;

    before(() => {
        iconPath = "/test/unittests/resources/icons/";
    });

    describe("createStyle", () => {
        let color = [55, 126, 184, 1];

        it("the result should be an instance of Style for undefined input", () => {
            const drawType = {},
                state = {
                    drawType,
                    pointSize: undefined,
                    symbol: {type: undefined},
                    zIndex: undefined
                },
                styleSettings = {
                    color: undefined,
                    colorContour: undefined,
                    strokeWidth: undefined
                },
                result = createStyle(state, styleSettings);

            expect(result instanceof Style).to.be.true;
        });
        it("the result color should be the same as the input color for a polyline", () => {
            const drawType = {geometry: "LineString", id: "drawLine"},
                state = {
                    drawType,
                    pointSize: undefined,
                    symbol: {type: undefined},
                    zIndex: undefined
                },
                styleSettings = {
                    color,
                    colorContour: undefined,
                    strokeWidth: undefined
                };

            expect(createStyle(state, styleSettings).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as the input color for a polygon", () => {
            const drawType = {geometry: "Polygon", id: "drawArea"},
                state = {
                    drawType,
                    pointSize: undefined,
                    symbol: {type: undefined},
                    zIndex: undefined
                },
                styleSettings = {
                    color,
                    colorContour: undefined,
                    strokeWidth: undefined
                };

            expect(createStyle(state, styleSettings).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as input color excluding the opacity which should be set as a separate parameter for a point of type image", () => {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const symbol = {type: "image", value: iconPath + "cloud.png"},
                drawType = {geometry: "Point", id: "drawSymbol"},
                state = {
                    drawType,
                    pointSize: undefined,
                    symbol,
                    zIndex: undefined
                },
                styleSettings = {
                    color,
                    colorContour: undefined,
                    strokeWidth: undefined
                },
                result = createStyle(state, styleSettings).getImage();

            expect(result.getOpacity()).to.deep.equal(color[3]);
        });
        it("the result color should be the same as the input color for text", () => {
            const drawType = {geometry: "Point", id: "writeText"},
                state = {
                    drawType,
                    pointSize: undefined,
                    symbol: {type: undefined},
                    zIndex: undefined
                },
                styleSettings = {
                    color: [255, 0, 0, 1],
                    colorContour: undefined,
                    strokeWidth: undefined
                };

            color = [255, 0, 0, 1];

            expect(createStyle(state, styleSettings).getText().getFill().getColor()).to.deep.equal(color);
        });
    });
});
