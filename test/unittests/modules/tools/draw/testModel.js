import {expect} from "chai";
import VectorLayer from "ol/layer/Vector.js";
import {Select, Modify, Draw} from "ol/interaction.js";
import {Style, Text} from "ol/style.js";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Model from "@modules/tools/draw/model.js";

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
                result = model.createDrawInteraction(drawType, layer);

            expect(result instanceof Draw).to.be.true;
        });
        it("should be the result color ist the same as input color", function () {
            var drawType = {
                    geometry: "Point",
                    text: "Punkt zeichnen"
                },
                layer = new VectorLayer(),
                color = [55, 126, 184, 1],
                result = model.createDrawInteraction(drawType, layer);

            expect(result.getOverlay().getStyle().getFill().getColor()).to.deep.equal(color);
        });
    });

    describe("getStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var result;

            model.setDrawType(undefined, undefined);
            model.setColor([]);
            result = model.getStyle();
            expect(result instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", function () {
            var result = model.getStyle(undefined, undefined);

            expect(result instanceof Style).to.be.true;
        });
        it("should return result color to be the same as input color for geometry point", function () {
            var color = [55, 126, 184, 1],
                result;

            model.setDrawType("Point", "Punkt zeichnen");
            model.setColor(color);
            result = model.getStyle();

            expect(result.getFill().getColor()).to.deep.equal(color);
        });
        it("should be the result color ist the same as input color for text", function () {
            var color = [255, 0, 0, 1],
                result;

            model.setDrawType("text", "Text schreiben");
            model.setColor(color);
            result = model.getStyle();

            expect(result.getText().getFill().getColor()).to.deep.equal(color);
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
                model.setDrawType("Point", "Punkt zeichnen");
                model.setRadius(10000);
                model.resetModule();
                expect(model.get("radius")).to.deep.equal(model.defaults.radius);
            });
            it("should opacity is equal default opacity", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.setOpacity(0.5);
                model.resetModule();

                expect(model.get("opacity")).is.equal(model.defaults.opacity);
            });
            it("should color is equal default color", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.setColor([111, 112, 113, 0.4]);
                model.resetModule();

                expect(model.get("color")).is.equal(model.defaults.color);
            });
            it("should drawType is equal default drawType", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.resetModule();

                expect(model.get("drawType")).to.deep.equal(model.defaults.drawType);
            });
        });

        describe("startSelectInteraction", function () {
            it("should be an instance of Select for empty input", function () {
                model.startSelectInteraction(new VectorLayer());

                expect(model.get("selectInteraction") instanceof Select).to.be.true;
            });
        });

        describe("createSelectInteraction", function () {
            it("the result should be an instance of Select for empty input", function () {
                expect(model.createSelectInteraction(new VectorLayer()) instanceof Select).to.be.true;
            });
        });

        describe("createModifyInteraction", function () {
            it("should be an instance of Modify for empty input", function () {
                var interaction = model.createModifyInteraction(new VectorLayer({source: new VectorSource()}));

                expect(interaction instanceof Modify).to.be.true;
            });
        });

        describe("deleteFeatures", function () {
            it("should empty the layerSource", function () {
                model.setLayer(model.createLayer());
                model.get("layer").getSource().getFeatures().push(new Feature());
                model.deleteFeatures();

                expect(model.get("layer").getSource().getFeatures()).is.empty;
            });
        });
    });
});
