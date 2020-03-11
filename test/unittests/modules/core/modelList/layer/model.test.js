import Layer from "@modules/core/modelList/layer/model.js";
import {expect} from "chai";

describe("core/modelList/layer/model", function () {
    let model;

    before(function () {
        model = new Layer();
    });

    afterEach(function () {
        model = new Layer();
    });

    describe("toggleIsSelected", function () {
        let secondModel;

        before(function () {
            secondModel = new Layer({channel: Radio.channel("ThisDoesNotExist")});

            model.attributes.isSelected = false;
            model.attributes.parentId = "Baselayer";
            model.attributes.name = "IDIDTHIS";
            model.attributes.layerSource = {};
            secondModel.attributes.isSelected = true;
            secondModel.attributes.parentId = "Baselayer";
            secondModel.attributes.layerSource = {};

            Radio.trigger("ModelList", "addModel", model);
            Radio.trigger("ModelList", "addModel", secondModel);
        });

        it("on selecting a baselayer all other baselayers should be deselected", function () {
            Radio.trigger("Layer", "toggleIsSelected");

            expect(model.attributes.isSelected).to.be.true;
            expect(secondModel.attributes.isSelected).to.be.false;
        });
    });
});
