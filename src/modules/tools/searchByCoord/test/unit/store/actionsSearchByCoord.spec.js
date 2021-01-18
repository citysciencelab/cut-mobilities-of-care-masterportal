import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsSearchByCoord";
import * as proj4 from "proj4";

describe("src/modules/tools/searchByCoord/store/actionsSearchByCoord.js", () => {
    let commit, dispatch, getters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("validateInput", () => {
        it("Validates the coordinates according to the ETRS89 coordinate system", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "5935103.67", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch, getters}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
            expect(commit.thirdCall.args[1]).to.equal("564459.13");
        });
        it("Throws an Error for wrong or missing coordinates - ETRS89", () => {
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

            actions.validateInput({state, commit, dispatch, getters}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
        });
        it("Throws an Error for wrong or missing coordinates - WGS84", () => {
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

            actions.validateInput({state, commit, dispatch, getters}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("resetSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
        });
        it("Throws an Error for wrong or missing coordinates - WGS84(Dezimalgrad)", () => {
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
    describe("transformCoordinates", () => {
        it("Does not transform coordinates of the ETRS89 format and moves to coordinates", () => {
            const state = {
                currentSelection: "ETRS89",
                selectedCoordinates: ["564459.13", "5935103.67"]
            };

            actions.transformCoordinates({state, dispatch});

            expect(dispatch.firstCall.args[0]).to.equal("setZoom");
            expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            expect(dispatch.secondCall.args[1]).to.eql(["564459.13", "5935103.67"]);
        });
        it("Transforms coordinates of the WGS84 format and moves to coordinates", () => {
            const state = {
                    currentSelection: "WGS84",
                    selectedCoordinates: [["53", "33", "25"], ["9", "59", "50"]]
                },
                proj4Result = Symbol(),
                proj4Spy = sinon.spy(() => {
                    return proj4Result;
                });

            sinon.stub(proj4, "default").callsFake(proj4Spy);
            actions.transformCoordinates({state, dispatch});

            expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:4326");
            expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25832");
            expect(dispatch.firstCall.args[0]).to.equal("setZoom");
            expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
        });
        it("Transforms coordinates of the WGS84(Dezimalgrad) format and moves to coordinates", () => {
            const state = {
                    currentSelection: "WGS84(Dezimalgrad)",
                    selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                },
                proj4Result = Symbol(),
                proj4Spy = sinon.spy(() => {
                    return proj4Result;
                });

            sinon.stub(proj4, "default").callsFake(proj4Spy);
            actions.transformCoordinates({state, dispatch});

            expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:4326");
            expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25832");
            expect(dispatch.firstCall.args[0]).to.equal("setZoom");
            expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
        });
    });
});
