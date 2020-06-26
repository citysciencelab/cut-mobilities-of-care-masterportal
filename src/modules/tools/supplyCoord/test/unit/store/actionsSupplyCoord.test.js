import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsSupplyCoord";

const {activateByUrlParam, positionClicked, newProjectionSelected, changedPosition} = actions;

describe("actionsSupplyCoord", function () {
    describe("activateByUrlParam", function () {
        it("activateByUrlParam  isinitopen=getcoord", done => {
            const rootState = {
                queryParams: {
                    "isinitopen": "getcoord"
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [
                {type: "setActive", payload: true}
            ], {}, done);
        });
        it("activateByUrlParam isinitopen=supplycoord", done => {
            const rootState = {
                queryParams: {
                    "isinitopen": "supplycoord"
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
    describe("positionClicked", function () {
        it("positionClicked", done => {
            const payload = {
                    coordinate: [1000, 2000]
                },
                state = {
                    updatePosition: true,
                    positionMapProjection: [300, 300]
                };

            testAction(positionClicked, payload, state, {}, [
                {type: "setPositionMapProjection", payload: payload.coordinate},
                {type: "changedPosition", payload: payload.coordinate, dispatch: true},
                {type: "setUpdatePosition", payload: false}
                // TODO add testing showMapMarker if MapMarker is migrated
            ], {}, done);
        });
    });
    describe("newProjectionSelected", function () {
        it("newProjectionSelected", done => {
            const state = {
                currentSelection: "projection 2",
                projections: [
                    {name: "projection 1", projName: "longlat"},
                    {name: "projection 2", projName: "longlat"}
                ]
            };

            testAction(newProjectionSelected, null, state, {}, [
                {type: "setCurrentProjectionName", payload: "projection 2"},
                {type: "setCurrentProjection", payload: {name: "projection 2"}}
            ], {getProjectionByName: () => {
                return {name: "projection 2"};
            }}, done);
        });
    });
    describe("changedPosition", function () {
        const rootState = {
                Map: {
                    map: {}
                }
            },
            proj1 = {name: "projection 1", projName: "longlat"},
            proj2 = {name: "projection 2", projName: "longlat"},
            state = {
                currentSelection: "projection 2",
                projections: [proj1, proj2],
                currentProjection: proj2,
                positionMapProjection: [300, 400]
            };

        it("changedPosition will call adjustPosition", done => {
            const payload = {
                position: [100, 200],
                targetProjection: proj2
            };

            testAction(changedPosition, null, state, rootState, [
                {type: "adjustPosition", payload: payload, dispatch: true}
            ], {getTransformedPosition: () => {
                return [100, 200];
            }}, done);
        });
        it("changedPosition will not call adjustPosition", done => {
            testAction(changedPosition, null, state, rootState, [],
                {getTransformedPosition: () => {
                    return null;
                }}, done);
        });
    });
});
