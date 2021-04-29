import Layer from "@modules/core/modelList/layer/model.js";
import {expect} from "chai";

describe("core/modelList/layer/model", function () {
    let model;

    before(function () {
        model = new Layer();
    });

    describe("toggleIsSelected", function () {
        let secondModel;

        before(function () {
            secondModel = new Layer({channel: Radio.channel("ThisDoesNotExist")});

            // Somehow some errors occur if the attributes for the models are set differently
            model.set("isSelected", false);
            model.set("parentId", "Baselayer");
            model.set("layerSource", {});
            secondModel.attributes.isSelected = true;
            secondModel.attributes.parentId = "Baselayer";
            secondModel.attributes.layerSource = {};

            Radio.trigger("ModelList", "addModel", model);
            Radio.trigger("ModelList", "addModel", secondModel);
        });

        after(function () {
            model = new Layer();
        });

        afterEach(function () {
            model.set("isSelected", false);
            secondModel.attributes.isSelected = true;
        });

        it("should deselect all other baselayers if the option singleBaselayer is set to true", function () {
            model.set("singleBaselayer", true);
            Radio.trigger("Layer", "toggleIsSelected");

            expect(model.attributes.isSelected).to.be.true;
            expect(secondModel.attributes.isSelected).to.be.false;
        });

        it("should lead to multiple baselayers being active if the option singleBaselayer is set to false", function () {
            model.set("singleBaselayer", false);
            Radio.trigger("Layer", "toggleIsSelected");

            expect(model.attributes.isSelected).to.be.true;
            expect(secondModel.attributes.isSelected).to.be.true;
        });

        it("should increase the transparency by 10 percent", function () {
            model.setTransparency("30");
            model.incTransparency();

            expect(model.get("transparency")).to.be.a("number");
            expect(model.get("transparency")).equals(40);
        });

        it("should decreases the transparency by 10 percent", function () {
            model.setTransparency("30");
            model.decTransparency();

            expect(model.get("transparency")).to.be.a("number");
            expect(model.get("transparency")).equals(20);
        });
    });
});
