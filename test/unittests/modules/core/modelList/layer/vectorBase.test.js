import {assert} from "chai";
import VectorBaseModel from "@modules/core/modelList/layer/vectorBase.js";
import {expect} from "chai";

describe("core/modelList/layer/vetctorBase", function () {
    let vectorBaseLayer;

    before(function () {
        vectorBaseLayer = new VectorBaseModel();
    });

    describe("createLayerSource", function () {
        it("should createLayerSource", function () {
            vectorBaseLayer.createLayerSource();

            expect(vectorBaseLayer.attributes).to.have.property("layerSource");
            assert.typeOf(vectorBaseLayer.attributes.layerSource, "Object");
            expect(vectorBaseLayer.attributes).not.to.have.property("clusterLayerSource");
        });
    });
});
