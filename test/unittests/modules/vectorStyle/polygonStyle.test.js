import {expect} from "chai";
import Model from "@modules/vectorStyle/polygonStyle";
import {Style, Stroke, Fill} from "ol/style.js";

describe("polygonStyleModel", function () {
    let styleModel;

    before(function () {
        styleModel = new Model();
    });

    describe("getStyle", function () {
        it("should return a style object", function () {
            expect(styleModel.getStyle()).to.be.an.instanceof(Style);
        });
        it("should return a style object that includes a stroke and a fill", function () {
            expect(styleModel.getStyle().getStroke()).to.be.an.instanceof(Stroke);
            expect(styleModel.getStyle().getFill()).to.be.an.instanceof(Fill);
        });
    });
});
