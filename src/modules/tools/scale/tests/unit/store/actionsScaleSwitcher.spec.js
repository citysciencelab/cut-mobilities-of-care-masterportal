import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsScaleSwitcher";

const {setActive, activateByUrlParam} = actions;

describe("actionsScaleSwitcher", function () {
    describe("activateByUrlParam", function () {
        it("activateByUrlParam  isinitopen=scaleSwitcher", done => {
            const rootState = {
                queryParams: {
                    "isinitopen": "scaleSwitcher"
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [
                {type: "setActive", payload: true}
            ], {}, done);
        });
        it("activateByUrlParam no isinitopen", done => {
            const rootState = {
                queryParams: {
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [], {}, done);
        });
    });
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
