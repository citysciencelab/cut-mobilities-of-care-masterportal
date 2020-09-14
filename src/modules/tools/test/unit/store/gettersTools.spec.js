import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../gettersTools";
import stateTools from "../../../stateTools";

describe("Tools", function () {

    describe("Tools getters", function () {
        it("returns the componentMap from state", function () {
            const state = {
                componentMap: {
                    scaleSwitcher: sinon.stub(),
                    supplyCoord: sinon.stub()
                }
            };

            expect(getters.componentMap(stateTools)).to.be.an("object");
            expect(Object.keys(getters.componentMap(state)).length).to.equals(2);
            expect(getters.componentMap(state)).to.include(state.componentMap);
        });
    });
    describe("Tools getters", function () {
        it("returns the configuredTools from state", function () {
            const state = {
                configuredTools: [{key: "supplyCoord"}, {key: "scaleSwitcher"}]
            };

            expect(getters.configuredTools(stateTools)).to.be.an("array").that.is.empty;
            expect(getters.configuredTools(state).length).to.equals(2);
            expect(getters.configuredTools(state)).to.deep.equal([
                {
                    key: "supplyCoord"
                },
                {
                    key: "scaleSwitcher"
                }
            ]);
        });
    });
    describe("Tools getters", function () {
        it("returns the active tools from state in this case one", function () {
            const state = {
                Draw: {
                    active: true
                },
                ScaleSwitcher: {
                    active: false
                }
            };

            expect(getters.getActiveToolNames(state)).to.be.an("array");
            expect(getters.getActiveToolNames(state).length).to.equals(1);
            expect(getters.getActiveToolNames(state)).to.includes("Draw");
        });
    });
    describe("Tools getters", function () {
        it("returns the active tools from state in this case two", function () {
            const state = {
                Draw: {
                    active: true
                },
                ScaleSwitcher: {
                    active: false
                },
                ToolXY: {
                    active: true
                }
            };

            expect(getters.getActiveToolNames(state)).to.be.an("array");
            expect(getters.getActiveToolNames(state).length).to.equals(2);
            expect(getters.getActiveToolNames(state)).to.includes("Draw", "ToolXY");
        });
    });
    describe("Tools getters", function () {
        it("returns an empty array tools from state", function () {
            const state = {
                Draw: {
                    active: false
                },
                ScaleSwitcher: {
                    active: false
                },
                ToolXY: {
                    active: false
                }
            };

            expect(getters.getActiveToolNames(state)).to.be.an("array");
            expect(getters.getActiveToolNames(state).length).to.equals(0);
        });
    });
    describe("Tools getters", function () {
        it("returns the configured tools from state", function () {
            const state = {
                configuredTools: [
                    {
                        component: {
                            name: "Draw"
                        }
                    },
                    {
                        component: {
                            name: "SupplyCoord"
                        }
                    }
                ]
            };

            expect(getters.getConfiguredToolNames(state)).to.be.an("array");
            expect(getters.getConfiguredToolNames(state).length).to.equals(2);
            expect(getters.getConfiguredToolNames(state)).to.include("Draw", "SupplyCoord");
        });
    });
});
