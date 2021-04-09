import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsSupplyCoord";

const {
    positionClicked,
    newProjectionSelected,
    changedPosition,
    adjustPosition,
    setCoordinates,
    checkPosition
} = actions;

describe("src/modules/tools/supplyCoord/store/actionsSupplyCoord.js", () => {
    describe("positionClicked", () => {
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
                {type: "setUpdatePosition", payload: false},
                {type: "MapMarker/placingPointMarker", payload: payload.coordinate, dispatch: true}
            ], {}, done);
        });
    });
    describe("newProjectionSelected", () => {
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
    describe("changedPosition", () => {
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
    describe("adjustPosition", () => {
        const rootState = {
                Map: {
                    map: {}
                }
            },
            proj1 = {name: "projection 1", projName: "utm"},
            proj2 = {name: "projection 2", projName: "longlat"};

        it("adjustPosition sets coordinate fields - longlat", done => {
            const payload = {
                position: [100, 200],
                targetProjection: proj2
            };

            testAction(adjustPosition, payload, {}, rootState, [
                {type: "setCoordinatesEastingField", payload: "160° 00′ 00″"},
                {type: "setCoordinatesNorthingField", payload: "100° 00′ 00″ E"}
            ], {}, done);
        });
        it("adjustPosition sets coordinate fields - utm", done => {
            const payload = {
                position: [100, 200],
                targetProjection: proj1
            };

            testAction(adjustPosition, payload, {}, rootState, [
                {type: "setCoordinatesEastingField", payload: "100.00"},
                {type: "setCoordinatesNorthingField", payload: "200.00"}
            ], {}, done);
        });
        it("adjustPosition sets coordinate fields - no projection and position does nothing", done => {
            const payload = {
                position: [],
                targetProjection: null
            };

            testAction(adjustPosition, payload, {}, rootState, [], {}, done);
        });
        it("adjustPosition sets coordinate fields - no position does not fail", done => {
            const payload = {
                position: null,
                targetProjection: proj1
            };

            testAction(adjustPosition, payload, {}, rootState, [], {}, done);
        });
        it("adjustPosition sets coordinate fields - empty position does not fail", done => {
            const payload = {
                position: [],
                targetProjection: proj1
            };

            testAction(adjustPosition, payload, {}, rootState, [], {}, done);
        });
    });
    describe("setCoordinates", () => {
        it("setCoordinates updates position", done => {
            const state = {
                    updatePosition: true
                },
                position = [100, 200],
                payload = {
                    coordinate: position
                };

            testAction(setCoordinates, payload, state, {}, [
                {type: "setPositionMapProjection", payload: position},
                {type: "changedPosition", payload: undefined, dispatch: true}
            ], {}, done);
        });
        it("setCoordinates not updates position", done => {
            const state = {
                    updatePosition: false
                },
                position = [100, 200],
                payload = {
                    coordinate: position
                };

            testAction(setCoordinates, payload, state, {}, [], {}, done);
        });
    });
    describe("checkPosition", () => {
        it("checkPosition sets positionMapProjection", done => {
            const state = {
                    updatePosition: true
                },
                position = [100, 200];

            testAction(checkPosition, position, state, {}, [
                {type: "setPositionMapProjection", payload: position}
            ], {}, done);
        });
        it("checkPosition not sets positionMapProjection", done => {
            const state = {
                    updatePosition: false
                },
                position = [100, 200];

            testAction(checkPosition, position, state, {}, [], {}, done);
        });
    });
});
