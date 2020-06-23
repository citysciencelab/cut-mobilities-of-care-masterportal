import actions from "../../store/actionsScaleLine";
import testAction from "../../../../../test/unittests/VueTestUtils";

describe("actionsScaleLine", () => {

    it("modifyScale() updateScaleNumber less than 10.000", done => {
        const payload = {scale: 1000},
            mutationPayload = "1000";

        testAction(actions.modifyScale, payload, {}, {}, [
            {type: "updateScaleNumber", payload: mutationPayload}
        ], done);
    });

    it("modifyScale() updateScaleNumber more than 10.000", done => {
        const payload = {scale: 100000},
            mutationPayload = "100 000";

        testAction(actions.modifyScale, payload, {}, {}, [
            {type: "updateScaleNumber", payload: mutationPayload}
        ], done);
    });

    it("updateScaleLineValue() to end with km", done => {
        const state = {scaleNumber: "100 000"},
            mutationPayload = "2 km";

        testAction(actions.updateScaleLineValue, null, state, {}, [
            {type: "updateScaleLineValue", payload: mutationPayload}
        ], done);
    });

    it("updateScaleLineValue() to end with m", done => {
        const state = {scaleNumber: "5 000"},
            mutationPayload = "100 m";

        testAction(actions.updateScaleLineValue, null, state, {}, [
            {type: "updateScaleLineValue", payload: mutationPayload}
        ], done);
    });


});
