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
});
