import sinon from "sinon";
import {expect} from "chai";
import actions from "../../store/actionsDraw";

describe("withoutGUIDraw", () => {
    let commit, dispatch, state;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });
    describe("cancelDrawWithoutGUI", () => {
        it("should dispatch as intended", () => {
            actions.cancelDrawWithoutGUI({dispatch});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetModule"]);
        });
    });
    // TODO: downloadFeaturesWithoutGUI
    describe("downloadViaRemoteInterface", () => {
        const geomType = Symbol(),
            result = Symbol();

        it("should dispatch as aspected", () => {
            dispatch = sinon.stub().resolves(result);

            actions.downloadViaRemoteInterface({dispatch}, geomType);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["downloadFeaturesWithoutGUI", geomType]);
        });
    });
    describe("editFeaturesWithoutGUI", () => {
        it("should dispatch as aspected", () => {
            actions.editFeaturesWithoutGUI({dispatch});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: false}]);
            expect(dispatch.secondCall.args).to.eql(["createModifyInteractionAndAddToMap"]);
        });
    });
    // TODO: initializeWithoutGUI
});
