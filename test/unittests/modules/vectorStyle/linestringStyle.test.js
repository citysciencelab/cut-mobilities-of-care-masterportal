import {expect} from "chai";
import Model from "@modules/vectorStyle/linestringStyle";
import {Style, Stroke} from "ol/style.js";

describe("linestringStyleModel", function () {
    let styleModel;

    before(function () {
        styleModel = new Model();
    });

    describe("getStyle", function () {
        it("should return a style object", function () {
            expect(styleModel.getStyle()).to.be.an.instanceof(Style);
        });
        it("should return a style object that includes a stroke", function () {
            expect(styleModel.getStyle().getStroke()).to.be.an.instanceof(Stroke);
        });
    });
});
