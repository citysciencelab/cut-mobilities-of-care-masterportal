import {expect} from "chai";
import VectorLayer from "ol/layer/Vector.js";
import {Select, Modify, Draw} from "ol/interaction.js";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import Model from "@modules/tools/draw/model.js";
import { Layer } from "ol/layer";

describe("drawModel", function () {
    var model;

    before(function () {
        model = new Model();
    });

    describe("createLayer", function () {
        it("should return an result that be not undefined", function () {
            expect(model.createLayer(undefined)).to.exist;
        });
        it("the result should be an instance of vectorLayer for undefined input", function () {
            var result = model.createLayer(undefined);

            expect(result instanceof VectorLayer).to.be.true;
        });
        it("the result should be an instance of vectorLayer for undefined input", function () {
            var layer = new VectorLayer();

            expect(model.createLayer(layer)).is.equal(layer);
        });
    });

    describe("createDrawInteraction", function () {
        it("the result should be an instance of Draw for empty input", function () {
            var drawType = "",
                layer = new VectorLayer(),
                color = [],
                result = model.createDrawInteraction(drawType, layer, color);

            expect(result instanceof Draw).to.be.true;
        });
        it("should be the result color ist the same as input color", function () {
            var drawType = {
                    geometry: "Point",
                    text: "Punkt zeichnen"
                },
                layer = new VectorLayer(),
                color = [255, 0, 0, 1],
                result = model.createDrawInteraction(drawType, layer, color);

            expect(result.getOverlay().getStyle().getFill().getColor()).to.equal(color);
        });
    });

    describe("getStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var drawType = {},
                color = [],
                result = model.getStyle(drawType, color);

            expect(result instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", function () {
            var result = model.getStyle(undefined, undefined);

            expect(result instanceof Style).to.be.true;
        });
        it("should be the result color ist the same as input color for geometry point", function () {
            var drawType = {
                    geometry: "Point",
                    text: "Punkt zeichnen"
                },
                color = [255, 0, 0, 1],
                result = model.getStyle(drawType, color);

            expect(result.getFill().getColor()).to.equal(color);
        });
        it("should be the result color ist the same as input color for text", function () {
            var drawType = {
                    geometry: "text",
                    text: "Text schreiben"
                },
                color = [255, 0, 0, 1],
                result = model.getStyle(drawType, color);

            expect(result.getText().getFill().getColor()).to.equal(color);
        });
    });

    describe("getTextStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var color = [],
                text = "",
                fontSize = 0,
                font = "";

            expect(model.getTextStyle(color, text, fontSize, font) instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style and Text for empty input", function () {
            var color = [],
                text = "",
                fontSize = 0,
                font = "";

            expect(model.getTextStyle(color, text, fontSize, font).getText() instanceof Text).to.be.true;
        });
        it("should be the result fontSize ist the same as input fontSize", function () {
            var color = [255, 255, 0, 1],
                text = "",
                fontSize = 10,
                font = "Arial",
                result = model.getTextStyle(color, text, fontSize, font);

            expect(result.getText().getFont()).to.equal("10px Arial");
        });
        it("the result should be an instance of Style for undefined input", function () {
            expect(model.getTextStyle(undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
    });

    describe("getDrawStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var color = [],
                drawGeometryType = "",
                strokeWidth = 0,
                radius = 0;

            expect(model.getDrawStyle(color, drawGeometryType, strokeWidth, radius) instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", function () {
            expect(model.getDrawStyle(undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
        it("should be the result color ist the same as input color", function () {
            var color = [0, 0, 0, 1],
                drawGeometryType = "Point",
                strokeWidth = 10,
                radius = 20,
                result = model.getDrawStyle(color, drawGeometryType, strokeWidth, radius);

            expect(result.getFill().getColor()).to.equal(color);
        });
        it("should be the result strokeWidth ist the same as input strokeWidth", function () {
            var color = [0, 0, 0, 1],
                drawGeometryType = "Point",
                strokeWidth = 10,
                radius = 20,
                result = model.getDrawStyle(color, drawGeometryType, strokeWidth, radius);

            expect(result.getStroke().getWidth()).to.equal(strokeWidth);
        });

        describe("resetModule", function () {
            it("should radius is equal default radius", function () {
                model.setRadius(10000);
                model.resetModule();

                expect(model.get("radius")).is.equal(model.defaults.radius);
            });
            it("should opacity is equal default opacity", function () {
                model.setOpacity(0.5);
                model.resetModule();

                expect(model.get("opacity")).is.equal(model.defaults.opacity);
            });
            it("should color is equal default color", function () {
                model.setColor([111, 112, 113, 0.4]);
                model.resetModule();

                expect(model.get("color")).is.equal(model.defaults.color);
            });
            it("should drawType is equal default drawType", function () {
                model.setDrawType("xy");
                model.resetModule();

                expect(model.get("drawType")).to.deep.equal(model.defaults.drawType);
            });
            it("should drawInteraction is equal default drawInteraction", function () {
                model.setDrawInteraction("xy");
                model.resetModule();

                expect(model.get("drawInteraction")).is.equal(model.defaults.drawInteraction);
            });
            it("should selectInteraction is equal default selectInteraction", function () {
                model.setSelectInteraction("xy");
                model.resetModule();

                expect(model.get("selectInteraction")).is.equal(model.defaults.selectInteraction);
            });
            it("should modifyInteraction is equal default modifyInteraction", function () {
                model.setModifyInteraction("xy");
                model.resetModule();

                expect(model.get("modifyInteraction")).is.equal(model.defaults.modifyInteraction);
            });
        });
    });
});
