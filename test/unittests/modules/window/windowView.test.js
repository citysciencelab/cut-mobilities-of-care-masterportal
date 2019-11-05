import View from "@modules/window/view.js";
import {expect} from "chai";

var view;

before(function () {
    view = new View();
    view.startX = 165;
    view.startY = 81;

});

describe("getNewPosition", function () {
    describe("function for window positioning with touchmove", function () {
        it("getNewPosition calculates the correct position values on angle 0", function () {
            view.model.set("rotationAngle", 0);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "562px", top: "109px"});
        });
        it("getNewPosition calculates the correct movement values on rotation angle 90", function () {
            view.model.set("rotationAngle", 90);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "793px", top: "109px"});
        });
        it("getNewPosition calculates the correct movement values on rotation angle 180", function () {
            view.model.set("rotationAngle", 180);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "822px", top: "340px"});
        });
        it("getNewPosition calculates the correct movement values on rotation angle 270", function () {
            view.model.set("rotationAngle", 270);
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "562px", top: "369px"});
        });
    });
});
