import {Style} from "ol/style.js";
import {expect} from "chai";
import {createDrawStyle} from "../../../../utils/style/createDrawStyle";

describe("src/modules/tools/draw/utils/style/createDrawStyle.js", () => {
    describe("createDrawStyle", () => {
        it("the result should be an instance of Style for empty input", () => {
            const color = [],
                colorContour = [],
                drawGeometryType = "",
                pointSize = 0,
                strokeWidth = 0,
                zIndex = 0;

            expect(createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex) instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", () => {
            expect(createDrawStyle(undefined, undefined, undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
        it("the result color of the contours should be the same as the input color for a polyline", () => {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polyline",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getColor()).to.equal(colorContour);
        });
        it("the result color of the contours should be the same as the input color for a polygon", () => {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polyline",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getColor()).to.equal(colorContour);
        });
        it("the result color should be the same as the input color for a polygon", () => {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polygon",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getFill().getColor()).to.equal(color);
        });
        it("the result strokeWidth should be the same as the input strokeWidth for a polyline", () => {
            const color = [0, 0, 0, 1],
                colorContour = [0, 0, 0, 1],
                drawGeometryType = "Polyline",
                pointSize = 20,
                strokeWidth = 10,
                zIndex = 0,
                result = createDrawStyle(color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex);

            expect(result.getStroke().getWidth()).to.equal(strokeWidth);
        });
        it("the result strokeWidth should be the same as the input strokeWidth for a polygon", () => {
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
});
