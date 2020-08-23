import {createDrawStyle} from "../../utils/style/createDrawStyle";
import {createIconStyle} from "../../utils/style/createIconStyle";
import {createStyle} from "../../utils/style/createStyle";
import {createTextStyle} from "../../utils/style/createTextStyle";

import {Style} from "ol/style.js";
import {expect} from "chai";

describe("styleFunctionsDraw", () => {
    let iconPath;

    before(function () {
        iconPath = "/test/unittests/resources/icons/";
    });
    describe("createDrawStyle", () => {
        it("the result should be an instance of Style for empty input", function () {
            const color = [],
                colorContour = [],
                drawGeometryType = "",
                pointSize = 0,
                strokeWidth = 0,
                zIndex = 0;

            expect(createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex) instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", function () {
            expect(createDrawStyle(undefined, undefined, undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
        it("the result color of the contours should be the same as the input color for a polyline", function () {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polyline",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getColor()).to.equal(colorContour);
        });
        it("the result color of the contours should be the same as the input color for a polygon", function () {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polyline",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getColor()).to.equal(colorContour);
        });
        it("the result color should be the same as the input color for a polygon", function () {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polygon",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getFill().getColor()).to.equal(color);
        });
        it("the result strokeWidth should be the same as the input strokeWidth for a polyline", function () {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polyline",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getWidth()).to.equal(strokeWidth);
        });
        it("the result strokeWidth should be the same as the input strokeWidth for a polygon", function () {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polygon",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getWidth()).to.equal(strokeWidth);
        });
    });

    describe("createIconStyle", () => {
        it("the result color should be the same as the input color for a symbol of type glyphicon", function () {
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    id: "iconLeaf",
                    type: "glyphicon",
                    value: "\ue103"
                },
                zIndex = 0,
                result = createIconStyle(color, pointSize, symbol, zIndex);

            expect(result.getText().getFill().getColor()).to.equal(color);
        });
        it("the result color should be the same as the input color for a symbol of type image whereas the opacity is saved in a different parameter", function () {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    id: "iconCloud",
                    type: "image",
                    value: iconPath + "cloud.png"
                },
                zIndex = 0,
                result = createIconStyle(color, pointSize, symbol, zIndex);

            expect(result.getImage().getColor()).to.deep.equal(color.slice(0, 3));
            expect(result.getImage().getOpacity()).to.equal(color[3]);
        });
        it("the result glyphicon should be the same as the input glyphicon", function () {
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    id: "iconLeaf",
                    type: "glyphicon",
                    value: "\ue103"
                },
                zIndex = 0,
                result = createIconStyle(color, pointSize, symbol, zIndex);

            expect(result.getText().getText()).to.equal(symbol.value);
        });
        it("the result path to the image should be the same as the input path", function () {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    caption: i18next.t("common:modules.tools.draw.iconList.iconCloud"),
                    type: "image",
                    value: iconPath + "cloud.png"
                },
                zIndex = 0,
                result = createIconStyle(color, pointSize, symbol, zIndex);

            expect(result.getImage().getSrc()).to.equal(symbol.value);
        });
        it("the method should throw an Error if the symbol is not of type \"glyphicon\" or \"image\"", function () {
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    id: "Image",
                    type: "my_personal_image",
                    value: iconPath + "my_personal_image.png"
                },
                zIndex = 0;

            expect(() => createIconStyle(color, pointSize, symbol, zIndex)).to.throw(Error, `Draw: The given type ${symbol.type} of the symbol is not supported!`);
        });
    });

    describe("createStyle", () => {
        let color = [55, 126, 184, 1];

        it("the result should be an instance of Style for undefined input", function () {
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
        it("the result color should be the same as the input color for a polyline", function () {
            const drawType = {value: "LineString", id: "drawLine"},
                symbol = {type: undefined};

            expect(createStyle({color, drawType, symbol}).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as the input color for a polygon", function () {
            const drawType = {value: "Polygon", id: "drawArea"},
                symbol = {type: undefined};

            expect(createStyle({color, drawType, symbol}).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as the input color for a point of type simple_point", function () {
            const symbol = {type: "simple_point", value: "simple_point"},
                drawType = {value: "Point", id: "drawPoint"};

            expect(createStyle({color, drawType, symbol}).getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as the input color for a point of type glyphicon", function () {
            const symbol = {type: "glyphicon", value: "\ue103"},
                drawType = {value: "Point", id: "drawPoint"};

            expect(createStyle({color, drawType, symbol}).getText().getFill().getColor()).to.deep.equal(color);
        });
        it("the result color should be the same as input color excluding the opacity which should be set as a separate parameter for a point of type image", function () {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const symbol = {type: "image", value: iconPath + "cloud.png"},
                drawType = {value: "Point", id: "drawPoint"},
                result = createStyle({color, drawType, symbol}).getImage();

            expect(result.getColor()).to.deep.equal(color.slice(0, 3));
            expect(result.getOpacity()).to.deep.equal(color[3]);
        });
        it("the result color should be the same as the input color for text", function () {
            const drawType = {value: "Point", id: "writeText"},
                symbol = {type: undefined};

            color = [255, 0, 0, 1];

            expect(createStyle({color, drawType, symbol}).getText().getFill().getColor()).to.deep.equal(color);
        });
    });
    describe("createTextStyle", () => {
        it("the result should be an instance of Style for empty input", function () {
            const color = [],
                font = "",
                fontSize = 0,
                text = "",
                zIndex = 0,
                result = createTextStyle(color, font, fontSize, text, zIndex);

            expect(result instanceof Style).to.be.true;
        });
        it("the result fontSize should be the same as the input fontSize", function () {
            const color = [255, 255, 0, 1],
                font = "Arial",
                fontSize = 10,
                text = "",
                zIndex = 0,
                result = createTextStyle(color, font, fontSize, text, zIndex);

            expect(result.getText().getFont()).to.equal("10px Arial");
        });
        it("the result should be an instance of Style for undefined input", function () {
            expect(createTextStyle(undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
    });
});
