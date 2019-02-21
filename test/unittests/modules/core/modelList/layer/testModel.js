import {expect} from "chai";
import LayerModel from "@modules/core/modelList/layer/model.js";

describe("core/modelList/layer/model", function () {
    var model = {};

    before(function () {
        model = new LayerModel();
    });

    describe("setIsRemoveable", function () {
        it("setIsRemoveable should return true value", function () {
            model.setIsRemoveable(true);
            expect(model.get("isRemoveable")).to.be.true;
        });
        it("setIsRemoveable should return false value", function () {
            model.setIsRemoveable(false);
            expect(model.get("isRemoveable")).to.be.false;
        });
        it("setIsRemoveable should return undefined value", function () {
            model.setIsRemoveable(undefined);
            expect(model.get("isRemoveable")).to.be.false;
        });
        it("setIsRemoveable should return null value", function () {
            model.setIsRemoveable(null);
            expect(model.get("isRemoveable")).to.be.false;
        });
        it("setIsRemoveable should return string value", function () {
            model.setIsRemoveable("string");
            expect(model.get("isRemoveable")).to.be.false;
        });
    });
});