import Layer from "@modules/core/modelList/layer/model.js";
import ModelList from "@modules/core/modelList/list.js";
import {expect} from "chai";

describe("core/modelList/layer/model", function () {
    let layer;

    before(function () {
        layer = new Layer();
    });

    afterEach(function () {
        layer = new Layer();
    });

    describe("toggleIsSelected", function () {
        let secondLayer;

        before(function () {
            secondLayer = new Layer();
            secondLayer.setIsSelected(true);
            layer.setIsSelected(false);
            ModelList.addModel(layer);
            ModelList.addModel(secondLayer);
        });

        it("on selecting a baselayer all other baselayers should be deselected", function () {
            layer.toggleIsSelected();
            expect(false).to.be.true;
        })
    });
});
