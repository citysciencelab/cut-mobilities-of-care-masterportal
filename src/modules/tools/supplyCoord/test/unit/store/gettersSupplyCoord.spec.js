import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersSupplyCoord";
import stateSupplyCoord from "../../../store/stateSupplyCoord";

const {
    selectPointerMove,
    projections,
    mapProjection,
    positionMapProjection,
    updatePosition,
    currentProjectionName,
    currentProjection,
    currentSelection,
    coordinatesEastingField,
    coordinatesNorthingField
} = getters;


describe("SupplyCoord", function () {
    describe("SupplyCoord getters", function () {
        it("returns the selectPointerMove from state", function () {
            const emptyFunc = sinon.stub(),
                state = {
                    selectPointerMove: emptyFunc
                };

            expect(selectPointerMove(stateSupplyCoord)).to.equals(null);
            expect(selectPointerMove(state)).to.equals(emptyFunc);
        });
        it("returns the projections from state", function () {
            const proj = [{name: "projection 1", projName: "utm"},
                    {name: "projection 2", projName: "longlat"}],
                state = {
                    projections: proj
                };

            expect(projections(stateSupplyCoord)).to.be.an("array").that.is.empty;
            expect(projections(state)).to.equals(proj);
        });
        it("returns the mapProjection from state", function () {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    mapProjection: proj
                };

            expect(mapProjection(stateSupplyCoord)).to.be.null;
            expect(mapProjection(state)).to.equals(proj);
        });
        it("returns the positionMapProjection from state", function () {
            const pos = [100, 200],
                state = {
                    positionMapProjection: pos
                };

            expect(positionMapProjection(stateSupplyCoord)).to.be.an("array").that.is.empty;
            expect(positionMapProjection(state)).to.equals(pos);
        });
        it("returns the updatePosition from state", function () {
            const state = {
                updatePosition: false
            };

            expect(updatePosition(stateSupplyCoord)).to.be.true;
            expect(updatePosition(state)).to.be.false;
        });
        it("returns the currentProjectionName from state", function () {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentProjectionName: name2
                };

            expect(currentProjectionName(stateSupplyCoord)).to.be.equals(name);
            expect(currentProjectionName(state)).to.be.equals(name2);
        });
        it("returns the currentProjection from state", function () {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    currentProjection: proj
                };

            expect(currentProjection(stateSupplyCoord)).to.be.null;
            expect(currentProjection(state)).to.equals(proj);
        });
        it("returns the currentSelection from state", function () {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentSelection: name2
                };

            expect(currentSelection(stateSupplyCoord)).to.be.equals(name);
            expect(currentSelection(state)).to.be.equals(name2);
        });
        it("returns the coordinatesEastingField from state", function () {
            const value = "160° 00′ 00″",
                state = {
                    coordinatesEastingField: value
                };

            expect(coordinatesEastingField(stateSupplyCoord)).to.be.equals("");
            expect(coordinatesEastingField(state)).to.be.equals(value);
        });
        it("returns the coordinatesNorthingField from state", function () {
            const value = "100° 00′ 00″ E",
                state = {
                    coordinatesNorthingField: value
                };

            expect(coordinatesNorthingField(stateSupplyCoord)).to.be.equals("");
            expect(coordinatesNorthingField(state)).to.be.equals(value);
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
        it("returns the isActive default value from state", function () {
            expect(getters.isActive(stateSupplyCoord)).to.be.false;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(getters.isVisibleInMenu(stateSupplyCoord)).to.be.true;
        });
        it("returns the isRoot default value from state", function () {
            expect(getters.isRoot(stateSupplyCoord)).to.be.false;
        });
        it("returns the parentId default value from state", function () {
            expect(getters.parentId(stateSupplyCoord)).to.equals("tool");
        });
        it("returns the type default value from state", function () {
            expect(getters.type(stateSupplyCoord)).to.equals("tool");
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(getters.deactivateGFI(stateSupplyCoord)).to.be.true;
        });

    });
});
