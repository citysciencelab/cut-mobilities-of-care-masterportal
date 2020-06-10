import mutations from "../../store/mutationsScaleLine";
import {expect} from "chai";

describe("mutationsScaleLine", () => {

    it("updateScaleNumber", () => {
        const state = {scaleNumber: ""},
            payload = "100 000";

        mutations.updateScaleNumber(state, payload);
        expect(state.scaleNumber).to.equal(payload);
    });

    it("updateScaleLineValue", () => {
        const state = {scaleLineValue: ""},
            payload = "2 km";

        mutations.updateScaleLineValue(state, payload);
        expect(state.scaleLineValue).to.equal(payload);
    });


});
