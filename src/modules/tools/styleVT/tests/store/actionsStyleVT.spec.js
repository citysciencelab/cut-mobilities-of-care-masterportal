import {expect} from "chai";
import sinon from "sinon";

import actions from "../../store/actionsStyleVT";

describe("src/modules/tools/styleVT/store/actionsStyleVT.js", () => {
    const layerOne = {id: "l1", name: "Layer One"},
        layerTwo = {id: "l2", name: "Layer Two"};
    let commit, state;

    beforeEach(() => {
        commit = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("refreshVectorTileLayerList", () => {
        beforeEach(() => {
            sinon.stub(Radio, "request").callsFake(() => [
                {get: key => layerOne[key]},
                {get: key => layerTwo[key]}
            ]);
            state = {
                layerModel: null
            };
        });
        it("should update the vectorTileLayerList and not update the currently selected layerModel", () => {
            actions.refreshVectorTileLayerList({state, commit});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setVectorTileLayerList", [layerOne, layerTwo]]);
        });
        it("should remove invisible layers from the vectorTileLayerList", () => {
            const id = "l3";

            state.layerModel = {id, get: () => id};
            actions.refreshVectorTileLayerList({state, commit});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setVectorTileLayerList", [layerOne, layerTwo]]);
            expect(commit.secondCall.args).to.eql(["setLayerModel", null]);
        });
    });
});

