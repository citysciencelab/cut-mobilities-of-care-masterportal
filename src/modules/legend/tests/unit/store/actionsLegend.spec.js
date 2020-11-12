import {expect} from "chai";
import actions from "../../../store/actionsLegend";

const {
    setShowLegend,
    addLegend,
    sortLegend,
    removeLegend,
    setLayerIdForLayerInfo,
    setLegendForLayerInfo,
    setLegendOnChanged
} = actions;

describe("src/modules/legend/store/actionsLegend.js", () => {
    describe("setShowLegend", () => {
        it("should set showLegend to true", () => {
            const state = {
                showLegend: false
            };

            setShowLegend({state}, true);
            expect(state.showLegend).to.be.true;
        });
        it("should set showLegend to false", () => {
            const state = {
                showLegend: true
            };

            setShowLegend({state}, false);
            expect(state.showLegend).to.be.false;
        });
    });
    describe("addLegend", () => {
        it("should add legend to legends", () => {
            const state = {
                    legends: []
                },
                legend = {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                };

            addLegend({state}, legend);
            expect(state.legends).to.deep.equal([
                {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                }
            ]);
        });
    });
    describe("sortLegend", () => {
        it("should sort legends by position descending", () => {
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
            };

            sortLegend({state});
            expect(state.legends).to.deep.equal([
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
            ]);
        });
    });
    describe("removeLegend", () => {
        it("should remove legend by id", () => {
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
            };

            removeLegend({state}, "456");
            expect(state.legends).to.deep.equal([
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
            ]);
        });
    });
    describe("setLayerIdForLayerInfo", () => {
        it("should set layerIdForLayerInfo", () => {
            const state = {
                layerIdForLayerInfo: ""
            };

            setLayerIdForLayerInfo({state}, "123");
            expect(state.layerIdForLayerInfo).to.equal("123");
        });
    });
    describe("setLegendForLayerInfo", () => {
        it("should set legend for layerInfo", () => {
            const state = {
                    layerInfoLegend: {}
                },
                layerInfoLegend = {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                };

            setLegendForLayerInfo({state}, layerInfoLegend);
            expect(state.layerInfoLegend).to.deep.equal({
                id: "123",
                name: "foobar",
                legend: ["getLegendGraphicRequest"],
                position: 1
            });
        });
    });
    describe("setLegendOnChanged", () => {
        it("should set changed legend", () => {
            const state = {
                    legendOnChanged: {}
                },
                legendOnChanged = {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                };

            setLegendOnChanged({state}, legendOnChanged);
            expect(state.legendOnChanged).to.deep.equal({
                id: "123",
                name: "foobar",
                legend: ["getLegendGraphicRequest"],
                position: 1
            });
        });
    });
});
