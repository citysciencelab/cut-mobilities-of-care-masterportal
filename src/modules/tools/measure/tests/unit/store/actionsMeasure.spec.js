import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsMeasure";
import source from "../../../utils/measureSource";

const {deleteFeatures} = actions;

describe("tools/measure/store/actionsMeasure", function () {
    let state, commit, rootGetters, clear;

    beforeEach(() => {
        state = {
            unlisteners: [sinon.spy()],
            interaction: {
                abortDrawing: sinon.spy()
            }
        };
        commit = sinon.spy();
        rootGetters = {
            "Map/map": {
                removeOverlay: sinon.spy()
            }
        };
        clear = sinon.spy();
        sinon.stub(source, "clear").callsFake(clear);
    });

    afterEach(sinon.restore);

    describe("deleteFeatures", function () {
        it("aborts drawing", function () {
            deleteFeatures({state, commit, rootGetters});

            expect(state.interaction.abortDrawing.calledOnce).to.be.true;
        });

        it("calls all unlisteners", function () {
            deleteFeatures({state, commit, rootGetters});

            expect(state.unlisteners[0].calledOnce).to.be.true;
        });

        it("clears the source", function () {
            deleteFeatures({state, commit, rootGetters});

            expect(clear.calledOnce).to.be.true;
        });

        it("resets the store", function () {
            deleteFeatures({state, commit, rootGetters});

            expect(commit.calledWith("setLines", {})).to.be.true;
            expect(commit.calledWith("setPolygons", {})).to.be.true;
            expect(commit.calledWith("setUnlisteners", [])).to.be.true;
        });
    });
});
