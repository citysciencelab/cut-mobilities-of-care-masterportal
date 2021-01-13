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
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
            expect(commit.thirdCall.args[1]).to.equal("564459.13");
        });
        it("Throws an Error for wrong coordinates (ETRS89)", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("setEastingErrorNoCoord");
            expect(commit.thirdCall.args[0]).to.equal("setNorthingErrorNoMatch");
        });
        it("Validates the coordinates according to the WGS84 coordinate system", () => {
            const state = {
                currentSelection: "WGS84",
                coordinatesEasting: {id: "easting", name: "", value: "53° 33′ 25", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "9° 59′ 50", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
        });
        it("Throws an Error for wrong coordinates (WGS84)", () => {
            const state = {
                currentSelection: "WGS84",
                coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("setEastingErrorNoCoord");
            expect(commit.thirdCall.args[0]).to.equal("setNorthingErrorNoMatch");
        });
        it("Validates the coordinates according to the WGS84(Dezimalgrad) coordinate system", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)",
                coordinatesEasting: {id: "easting", name: "", value: "53.55555°", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "10.01234°", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
        });
        it("Throws an Error for wrong coordinates (WGS84(Dezimalgrad))", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)",
                coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("setEastingErrorNoCoord");
            expect(commit.thirdCall.args[0]).to.equal("setNorthingErrorNoMatch");
        });
    });
});
