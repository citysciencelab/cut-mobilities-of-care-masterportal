import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsScaleSwitcher";

const {setActive} = actions;

describe("actionsScaleSwitcher", function () {
    describe("setActive", function () {
        const rootState = {
            Map: {
                scale: "60033.65329850641"
            }
        };

        it("setActive(true) should set rounded currentScale", done => {
            const payload = true,
                mutationActivePayload = true;

            testAction(setActive, payload, {}, rootState, [
                {type: "setActive", payload: mutationActivePayload}
            ], {}, done);

        });
        it("setActive(false) should not set currentScale", done => {
            const payload = false,
                mutationActivePayload = false;

            testAction(setActive, payload, {}, rootState, [
                {type: "setActive", payload: mutationActivePayload}
            ], {}, done);

        });
    });
});
