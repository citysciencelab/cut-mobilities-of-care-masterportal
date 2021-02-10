import {expect} from "chai";
import mutations from "../../../store/mutationsSearchByCoord";

const {setExample} = mutations;

describe("src/modules/tools/searchByCoord/store/mutationsSearchByCoord.js", () => {

    describe("setExample", () => {
        it("Sets the example values according to the ETRS89 coordinate system", () => {
            const state = {
                currentSelection: "ETRS89"
            };

            setExample(state);

            expect(state.coordinatesEastingExample).to.equals("564459.13");
            expect(state.coordinatesNorthingExample).to.equals("5935103.67");

        });
        it("Sets the example values according to the WGS84 coordinate system", () => {
            const state = {
                currentSelection: "WGS84"
            };

            setExample(state);

            expect(state.coordinatesEastingExample).to.equals("53° 33′ 25″");
            expect(state.coordinatesNorthingExample).to.equals("9° 59′ 50″");
        });
        it("Sets the example values according to the WGS84(Dezimalgrad) coordinate system", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)"
            };

            setExample(state);

            expect(state.coordinatesEastingExample).to.equals("53.55555°");
            expect(state.coordinatesNorthingExample).to.equals("10.01234°");
        });
    });

});
