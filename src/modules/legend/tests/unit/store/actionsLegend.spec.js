import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsLegend";

const {
    setShowLegend,
    addLegend,
    sortLegend,
    removeLegend,
    setShowLegendInMenu,
    setLegendOnChanged,
    setLayerCounterIdForLayerInfo,
    setLayerIdForLayerInfo,
    setLegendForLayerInfo
} = actions;

describe("src/modules/legend/store/actionsLegend.js", () => {
    describe("setShowLegend", () => {
        it("should set showLegend to true", done => {
            const payload = true,
                state = {
                    showLegend: false
                };

            testAction(setShowLegend, payload, state, {}, [
                {type: "setShowLegend", payload: payload}
            ], {}, done);
        });
        it("should set showLegend to false", done => {
            const payload = false,
                state = {
                    showLegend: false
                };

            testAction(setShowLegend, payload, state, {}, [
                {type: "setShowLegend", payload: payload}
            ], {}, done);
        });
    });
    describe("addLegend", () => {
        it("should add legend to legends", done => {
            const payload = {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                },
                state = {
                    legends: []
                };

            testAction(addLegend, payload, state, {}, [
                {type: "setLegends", payload: [payload]}
            ], {}, done);
        });
    });
    describe("sortLegend", () => {
        it("should sort legends by position descending", done => {
            const state = {
                    legends: [{
                        id: "123",
                        name: "foobar",
                        legend: ["getLegendGraphicRequest"],
                        position: 1
                    },
                    {
                        id: "789",
                        name: "barfoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 3
                    },
                    {
                        id: "456",
                        name: "foofoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 2
                    }]
                },
                sorted = [
                    {
                        id: "789",
                        name: "barfoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 3
                    },
                    {
                        id: "456",
                        name: "foofoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 2
                    },
                    {
                        id: "123",
                        name: "foobar",
                        legend: ["getLegendGraphicRequest"],
                        position: 1
                    }
                ];

            testAction(sortLegend, null, state, {}, [
                {type: "setLegends", payload: sorted}
            ], {}, done);
        });
    });
    describe("removeLegend", () => {
        it("should remove legend by id", done => {
            const state = {
                    legends: [{
                        id: "789",
                        name: "barfoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 3
                    },
                    {
                        id: "456",
                        name: "foofoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 2
                    },
                    {
                        id: "123",
                        name: "foobar",
                        legend: ["getLegendGraphicRequest"],
                        position: 1
                    }]
                },
                payload = "456",
                legendsAfterRemove = [
                    {
                        id: "789",
                        name: "barfoo",
                        legend: ["getLegendGraphicRequest"],
                        position: 3
                    },
                    {
                        id: "123",
                        name: "foobar",
                        legend: ["getLegendGraphicRequest"],
                        position: 1
                    }
                ];

            testAction(removeLegend, payload, state, {}, [
                {type: "setLegends", payload: legendsAfterRemove}
            ], {}, done);
        });
    });
    describe("setShowLegendInMenu", () => {
        it("should set showLegendInMenu to true", done => {
            const payload = true,
                state = {
                    showLegendInMenu: false
                };

            testAction(setShowLegendInMenu, payload, state, {}, [
                {type: "setShowLegendInMenu", payload: payload}
            ], {}, done);
        });
        it("should set showLegend to false", done => {
            const payload = false,
                state = {
                    showLegendInMenu: false
                };

            testAction(setShowLegendInMenu, payload, state, {}, [
                {type: "setShowLegendInMenu", payload: payload}
            ], {}, done);
        });
    });
    describe("setLegendOnChanged", () => {
        it("should set changed legend", done => {
            const state = {
                    legendOnChanged: {}
                },
                legendOnChanged = {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                };

            testAction(setLegendOnChanged, legendOnChanged, state, {}, [
                {type: "setLegendOnChanged", payload: legendOnChanged}
            ], {}, done);
        });
    });
    describe("setLayerIdForLayerInfo", () => {
        it("should set LayerIdForLayerInfo", done => {
            const payload = "id",
                state = {
                    layerIdForLayerInfo: null
                };

            testAction(setLayerIdForLayerInfo, payload, state, {}, [
                {type: "setLayerIdForLayerInfo", payload: payload}
            ], {}, done);
        });
    });
    describe("setLayerCounterIdForLayerInfo", () => {
        it("should set layerCounterIdForLayerInfo", done => {
            const payload = "12:00",
                state = {
                    layerCounterIdForLayerInfo: null
                };

            testAction(setLayerCounterIdForLayerInfo, payload, state, {}, [
                {type: "setLayerCounterIdForLayerInfo", payload: payload}
            ], {}, done);
        });
    });
    describe("setLegendForLayerInfo", () => {
        it("should set legendForLayerInfo", done => {
            const payload = {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                },
                state = {
                    legendForLayerInfo: null
                };

            testAction(setLegendForLayerInfo, payload, state, {}, [
                {type: "setLayerInfoLegend", payload: payload}
            ], {}, done);
        });
    });
});
