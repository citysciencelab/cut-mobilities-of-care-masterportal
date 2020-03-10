import Layer from "@modules/core/modelList/layer/model.js";
import ModelList from "@modules/core/modelList/list.js";
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
            // secondLayer = new Layer();
            /* secondLayer.setIsSelected(true);
            layer.setIsSelected(false);
            ModelList.addModel(layer);
            ModelList.addModel(secondLayer);*/
        });

        it("on selecting a baselayer all other baselayers should be deselected", function () {
            // model.toggleIsSelected();
            // expect(false).to.be.true;
        });
    });
});
