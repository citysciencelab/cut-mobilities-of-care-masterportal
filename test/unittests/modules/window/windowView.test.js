import View from "@modules/window/view.js";
import {expect} from "chai";

let view;

before(function () {
    view = new View();
    view.model.set("startX", 165);
    view.model.set("startY", 81);
});

describe("getNewPosition", function () {
    describe("function for window positioning with touchmove", function () {
        it("getNewPosition calculates the correct position values on angle 0", function () {
            view.model.set("rotationAngle", 0);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "562px", top: "109px"});
        });
        it("getNewPosition calculates the correct movement values on rotation angle 90", function () {
            view.model.set("rotationAngle", -90);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "793px", top: "109px"});
        });
        it("getNewPosition calculates the correct movement values on rotation angle 180", function () {
            view.model.set("rotationAngle", -180);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "822px", top: "340px"});
        });
        it("getNewPosition calculates the correct movement values on rotation angle 270", function () {
            view.model.set("rotationAngle", -270);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "562px", top: "369px"});
        });
        it("getNewPosition calculates values within the map width and height on angle 0", function () {
            view.model.set("rotationAngle", 0);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.below(4000);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).top, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: 2200}, 260, 231, 4000, 2000).top, 10)).to.be.below(2000);
        });
        it("getNewPosition calculates values within the map width and height on angle 90", function () {
            view.model.set("rotationAngle", -90);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.below(4000);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).top, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: 2200}, 260, 231, 4000, 2000).top, 10)).to.be.below(2000);
        });
        it("getNewPosition calculates values within the map width and height on angle 180", function () {
            view.model.set("rotationAngle", -180);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.below(4000);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).top, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: 2200}, 260, 231, 4000, 2000).top, 10)).to.be.below(2000);
        });
        it("getNewPosition calculates values within the map width and height on angle 270", function () {
            view.model.set("rotationAngle", -270);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.below(4000);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).top, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: 2200}, 260, 231, 4000, 2000).top, 10)).to.be.below(2000);
        });
    });

});
