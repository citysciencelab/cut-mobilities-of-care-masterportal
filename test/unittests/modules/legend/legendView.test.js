import View from "@modules/legend/desktop/view.js";
import Model from "@modules/legend/model.js";
import {expect} from "chai";

let view,
    fakeModel,
    model;

before(function () {
    this.enableTimeouts(false);

    fakeModel = {
        legendParams: [],
        paramsStyleWMS: [],
        paramsStyleWMSArray: [],
        startX: 165,
        startY: 81,
        rotationAngle: 0,
        isActive: true,
        id: "legend",
        isRoot: true,
        isVisibleInMenu: true,
        keepOpen: true,
        parentId: "root",
        renderToSidebar: false,
        renderToWindow: false,
        type: "tool",
        windowLeft: 0,
        windowTop: 0,
        glyphicon: "glyphicon-book"
    };

    model = new Model({attributes: fakeModel});
    view = new View({model: model});

});

describe("getNewPosition", function () {
    describe("function for legend window positioning with touchmove", function () {
        it("getNewPosition calculates the correct position values on angle 0", function () {
            expect(view.getNewPosition({clientX: 727, clientY: 190}, 260, 231, 4000, 2000)).to.eql({left: "727px", top: "130px"});
        });

        it("getNewPosition calculates values within the map width and height on angle 0", function () {
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.below(4000);
            expect(parseInt(view.getNewPosition({clientX: 4050, clientY: -50}, 260, 231, 4000, 2000).top, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: -50}, 260, 231, 4000, 2000).left, 10)).to.be.above(0);
            expect(parseInt(view.getNewPosition({clientX: -50, clientY: 2200}, 260, 231, 4000, 2000).top, 10)).to.be.below(2000);
        });
    });
});
