import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersSupplyCoord";
import stateSupplyCoord from "../../../store/stateSupplyCoord";

describe("SupplyCoord", function () {

    describe("SupplyCoord getters", function () {
        it("returns the selectPointerMove from state", function () {
            const emptyFunc = sinon.stub(),
                state = {
                    selectPointerMove: emptyFunc
                };

            expect(getters.selectPointerMove(stateSupplyCoord)).to.equals(null);
            expect(getters.selectPointerMove(state)).to.equals(emptyFunc);
        });
        it("returns the projections from state", function () {
            const proj = [{name: "projection 1", projName: "utm"},
                    {name: "projection 2", projName: "longlat"}],
                state = {
                    projections: proj
                };

            expect(getters.projections(stateSupplyCoord)).to.be.an("array").that.is.empty;
            expect(getters.projections(state)).to.equals(proj);
        });
        it("returns the mapProjection from state", function () {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    mapProjection: proj
                };

            expect(getters.mapProjection(stateSupplyCoord)).to.be.null;
            expect(getters.mapProjection(state)).to.equals(proj);
        });
        it("returns the positionMapProjection from state", function () {
            const pos = [100, 200],
                state = {
                    positionMapProjection: pos
                };

            expect(getters.positionMapProjection(stateSupplyCoord)).to.be.an("array").that.is.empty;
            expect(getters.positionMapProjection(state)).to.equals(pos);
        });
        it("returns the updatePosition from state", function () {
            const state = {
                updatePosition: false
            };

            expect(getters.updatePosition(stateSupplyCoord)).to.be.true;
            expect(getters.updatePosition(state)).to.be.false;
        });
        it("returns the currentProjectionName from state", function () {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentProjectionName: name2
                };

            expect(getters.currentProjectionName(stateSupplyCoord)).to.be.equals(name);
            expect(getters.currentProjectionName(state)).to.be.equals(name2);
        });
        it("returns the currentProjection from state", function () {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    currentProjection: proj
                };

            expect(getters.currentProjection(stateSupplyCoord)).to.be.null;
            expect(getters.currentProjection(state)).to.equals(proj);
        });
        it("returns the currentSelection from state", function () {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentSelection: name2
                };

            expect(getters.currentSelection(stateSupplyCoord)).to.be.equals(name);
            expect(getters.currentSelection(state)).to.be.equals(name2);
        });
        it("returns the coordinatesEastingField from state", function () {
            const value = "160° 00′ 00″",
                state = {
                    coordinatesEastingField: value
                };

            expect(getters.coordinatesEastingField(stateSupplyCoord)).to.be.equals("");
            expect(getters.coordinatesEastingField(state)).to.be.equals(value);
        });
        it("returns the coordinatesNorthingField from state", function () {
            const value = "100° 00′ 00″ E",
                state = {
                    coordinatesNorthingField: value
                };

            expect(getters.coordinatesNorthingField(stateSupplyCoord)).to.be.equals("");
            expect(getters.coordinatesNorthingField(state)).to.be.equals(value);
        });
    });
    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(getters.name(stateSupplyCoord)).to.be.equals("Koordinaten abfragen");
        });
        it("returns the glyphicon default value from state", function () {
            expect(getters.glyphicon(stateSupplyCoord)).to.equals("glyphicon-screenshot");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(getters.renderToWindow(stateSupplyCoord)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(getters.resizableWindow(stateSupplyCoord)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(getters.isVisibleInMenu(stateSupplyCoord)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(getters.deactivateGFI(stateSupplyCoord)).to.be.true;
        });

    });
});
