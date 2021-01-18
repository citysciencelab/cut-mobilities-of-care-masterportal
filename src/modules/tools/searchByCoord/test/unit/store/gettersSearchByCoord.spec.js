import {expect} from "chai";
import getters from "../../../store/gettersSearchByCoord";

const {getEastingError, getNorthingError} = getters;

describe("src/modules/tools/searchByCoord/store/gettersSearchByCoord.js", () => {

    describe("getEastingError", () => {
        it("Returns true if the easting coordinates don´t match the specified format", () => {
            const state = {
                eastingNoCoord: false,
                eastingNoMatch: true
            };

            expect(getEastingError(state)).to.be.true;
        });
        it("Returns true if no easting coordinates were entered", () => {
            const state = {
                eastingNoCoord: true,
                eastingNoMatch: false
            };

            expect(getEastingError(state)).to.be.true;
        });
        it("Returns false when there are no easting errors", () => {
            const state = {
                eastingNoCoord: false,
                eastingNoMatch: false
            };

            expect(getEastingError(state)).to.be.false;
        });
    });
    describe("getNorthingError", () => {
        it("Returns true if the northing coordinates don´t match the specified format", () => {
            const state = {
                northingNoCoord: false,
                northingNoMatch: true
            };

            expect(getNorthingError(state)).to.be.true;
        });
        it("Returns true if no northing coordinates were entered", () => {
            const state = {
                northingNoCoord: true,
                northingNoMatch: false
            };

            expect(getNorthingError(state)).to.be.true;
        });
        it("Returns false when there are no northing errors", () => {
            const state = {
                northingNoCoord: false,
                northingNoMatch: false
            };

            expect(getNorthingError(state)).to.be.false;
        });
    });
});
