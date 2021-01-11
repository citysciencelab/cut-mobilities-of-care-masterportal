import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsSearchByCoord";

describe("src/modules/tools/supplyCoord/store/actionsSearchByCoord.js", () => {
    let commit, dispatch;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("validateInput", () => {
        it("Validates the coordinates according to the ETRS89 coordinate system", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "5935103.67", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(state.coordinatesEasting.errorMessage).to.equals("");
            expect(state.coordinatesNorthing.errorMessage).to.equals("");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
            expect(commit.thirdCall.args[1]).to.equal("564459.13");
        });
    });
});
