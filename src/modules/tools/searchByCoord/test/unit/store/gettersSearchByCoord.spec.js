import {expect} from "chai";
import getters from "../../../store/gettersSearchByCoord";

const {getError} = getters;

describe("src/modules/tools/searchByCoord/store/gettersSearchByCoord.js", () => {

    describe("getError", () => {
        it("Sets the easting error true if there are no coordinates or they don´t match the specified format", () => {
            const state = {
                eastingNoCoord: true,
                eastingNoMatch: true
            };

            getError(state);
            expect(state.eastingError).to.be.true;
        });
        it("Sets the easting error true if at least one error was detected", () => {
            const state = {
                eastingNoCoord: true,
                eastingNoMatch: false
            };

            getError(state);
            expect(state.eastingError).to.be.true;
        });
        it("Sets the easting error to false when there are no errors", () => {
            const state = {
                eastingNoCoord: false,
                eastingNoMatch: false
            };

            getError(state);
            expect(state.eastingError).to.be.false;
        });
        it("Sets the northing error true if there are no coordinates or they don´t match the specified format", () => {
            const state = {
                northingNoCoord: true,
                northingNoMatch: true
            };

            getError(state);
            expect(state.northingError).to.be.true;
        });
        it("Sets the northing error true if at least one error was detected", () => {
            const state = {
                northingNoCoord: false,
                northingNoMatch: true
            };

            getError(state);
            expect(state.northingError).to.be.true;
        });
        it("Sets the northing error to false when there are no errors", () => {
            const state = {
                northingNoCoord: false,
                northingNoMatch: false
            };

            getError(state);
            expect(state.northingError).to.be.false;
        });
    });
});
