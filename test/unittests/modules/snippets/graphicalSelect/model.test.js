import {expect} from "chai";
import Model from "@modules/snippets/graphicalSelect/model.js";

describe("snippets/graphicalSelect/model", function () {
    let model;

    before(function () {
        model = new Model({
            id: "test_graphicalselection"
        });
    });

    describe("resetGeographicSelection", function () {
        it("should resetGeographicSelection to 'Box'", function () {
            const values = model.get("geographicValues");

            model.setValues(values[1]);
            expect(model.get("values") === values[1]);
            model.resetGeographicSelection();
            expect(model.get("values") === values[0]);
        });
    });

    describe("setStatus", function () {

        it("should set status", function () {
            model.setStatus(model.id, true);
            expect(model.get("drawInteraction").isActive === true);
            expect(model.get("currentValue") === "Box");
            model.setStatus(model.id, false);
            expect(model.get("drawInteraction").isActive === false);
        });
    });

    describe("roundRadius", function () {
        it("should return 405.4 m for input 405.355", function () {
            expect(model.roundRadius(405.355)).to.equal("405.4 m");
        });
        it("should return 405.4 m for input 1305.355", function () {
            expect(model.roundRadius(1305.355)).to.equal("1.31 km");
        });
        it("should return 405.4 m for input 500.355", function () {
            expect(model.roundRadius(500.355)).to.equal("0.5 km");
        });
    });

    describe("toggleOverlay", function () {
        it("overlay should be attached to the map", function () {
            model.toggleOverlay("Box", model.get("circleOverlay"));
            expect(model.get("circleOverlay").getMap()).to.be.undefined;
        });
        it("overlay should not be attached to the map", function () {
            model.toggleOverlay("Circle", model.get("circleOverlay"));
            expect(model.get("circleOverlay").getMap()).to.not.be.undefined;
        });
    });

    describe("showOverlayOnSketch", function () {
        it("should update overlay innerHTML on geometry changes", function () {
            model.showOverlayOnSketch(50, []);
            expect(model.get("circleOverlay").getElement().innerHTML).to.equal("50 m");
        });
        it("should update overlay position on geometry changes", function () {
            const outerCoord = [556440.777563342, 5935149.148611423];

            model.showOverlayOnSketch(50, outerCoord);
            expect(outerCoord).to.deep.equal(model.get("circleOverlay").getPosition());
        });
    });

    describe("createDrawInteraction", function () {
        it("should have a draw interaction", function () {
            model.createDrawInteraction("Box");
            expect(model.get("drawInteraction")).not.to.be.undefined;
        });
    });
});
