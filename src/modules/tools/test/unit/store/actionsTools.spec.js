import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../actionsTools";
import sinon from "sinon";

const {setToolActive, languageChanged, addTool, activateByUrlParam} = actions;

describe("actionsTools", function () {
    describe("setToolActive", function () {
        const state = {
            ScaleSwitcher: {
                id: "scaleSwitcher"
            }
        };

        it("setToolActive set one tool to active", done => {
            const payload = {
                id: "scaleSwitcher",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setActive", payload: payload.active, dispatch: true}
            ], {}, done);
        });
        it("setToolActive deactivate a tool", done => {
            const payload = {
                id: "scaleSwitcher",
                active: false
            };

            testAction(setToolActive, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setActive", payload: payload.active, dispatch: true}
            ], {}, done);
        });
        it("setToolActive no tool is active by payload.id is not defined", done => {
            const payload = {
                id: "otherTool",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [], {}, done);
        });
    });

    describe("languageChanged", function () {
        const state = {
            ScaleSwitcher: {
                id: "scaleSwitcher"
            }
        };

        it("languageChanged", done => {
            const payload = {
                id: "scaleSwitcher",
                name: "Scale switcher"
            };

            testAction(languageChanged, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setName", payload: payload.name}
            ], {}, done);
        });
    });

    describe("addTool", function () {
        it("addTool", done => {
            const tool = {
                    default: {
                        name: "VueAddon"
                    }
                },
                state = {
                    componentMap: {
                        scaleSwitcher: sinon.stub()
                    }
                };

            testAction(addTool, tool, state, {}, [
                {type: "setComponentMap", payload: Object.assign(state.componentMap, {[tool.default.name]: tool.default})}
            ], {}, done);
        });
    });

    describe("activateByUrlParam", function () {
        it("activateByUrlParam  isinitopen=scaleSwitcher", done => {
            const rootState = {
                    queryParams: {
                        "isinitopen": "scaleSwitcher"
                    }
                },
                toolName = "ScaleSwitcher";

            testAction(activateByUrlParam, toolName, {}, rootState, [
                {type: toolName + "/setActive", payload: true}
            ], {}, done);
        });
        it("activateByUrlParam no isinitopen", done => {
            const rootState = {
                    queryParams: {
                    }
                },
                toolName = "ScaleSwitcher";

            testAction(activateByUrlParam, toolName, {}, rootState, [], {}, done);
        });
    });
});
