import {expect} from "chai";
import LayerModel from "@modules/core/modelList/layer/model.js";

describe("core/modelList/layer/model", function () {
    var model = {};

    before(function () {
        model = new LayerModel();
    });

    describe("setIsRemovable", function () {
        it("setIsRemovable should return true value", function () {
            model.setIsRemovable(true);
            expect(model.get("isRemovable")).to.be.true;
        });
        it("setIsRemovable should return false value", function () {
            model.setIsRemovable(false);
            expect(model.get("isRemovable")).to.be.false;
        });
        it("setIsRemovable should return undefined value", function () {
            model.setIsRemovable(undefined);
            expect(model.get("isRemovable")).to.be.false;
        });
        it("setIsRemovable should return null value", function () {
            model.setIsRemovable(null);
            expect(model.get("isRemovable")).to.be.false;
        });
        it("setIsRemovable should return string value", function () {
            model.setIsRemovable("string");
            expect(model.get("isRemovable")).to.be.false;
        });
    });
});