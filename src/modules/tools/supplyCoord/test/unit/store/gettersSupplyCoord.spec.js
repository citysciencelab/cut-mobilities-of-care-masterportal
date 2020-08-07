import {expect} from "chai";
import sinon from "sinon";
import Getters from "../../../store/gettersSupplyCoord";
import {createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("Getters.vue", () => {
    let getters;

    beforeEach(() => {
        getters = {
            active: () => false,
            id: () => "supplyCoord",
            selectPointerMove: () => null,
            projections: () => [],
            mapProjection: () => null,
            positionMapProjection: () => [],
            updatePosition: () => true,
            currentProjectionName: () => "EPSG:25832",
            currentProjection: () => null,
            currentSelection: () => "EPSG:25832",
            coordinatesEastingField: () => "",
            coordinatesNorthingField: () => "",

            // defaults for config.json parameters
            name: () => "Koordinaten abfragen",
            glyphicon: () => "glyphicon-screenshot",
            renderToWindow: () => true,
            resizableWindow: () => true,
            isActive: () => false,
            isVisibleInMenu: () => true,
            isRoot: () => false,
            parentId: () => "tool",
            type: () => "tool",
            deactivateGFI: () => true
        };
    });

    describe("SupplyCoord getters", function () {
        it("returns the active from state", function () {
            const state = {
                active: true
            };

            expect(getters.active()).to.be.false;
            expect(Getters.active(state)).to.be.true;
        });
        it("returns the id from state", function () {
            const newId = "Neue_Id",
                id = "supplyCoord",
                state = {
                    id: newId
                };

            expect(getters.id()).to.be.equals(id);
            expect(Getters.id(state)).to.equals(newId);
        });
        it("returns the selectPointerMove from state", function () {
            const emptyFunc = sinon.stub(),
                state = {
                    selectPointerMove: emptyFunc
                };

            expect(getters.selectPointerMove()).to.equals(null);
            expect(Getters.selectPointerMove(state)).to.equals(emptyFunc);
        });
        it("returns the projections from state", function () {
            const proj = [{name: "projection 1", projName: "utm"},
                    {name: "projection 2", projName: "longlat"}],
                state = {
                    projections: proj
                };

            expect(getters.projections()).to.be.an("array").that.is.empty;
            expect(Getters.projections(state)).to.equals(proj);
        });
        it("returns the mapProjection from state", function () {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    mapProjection: proj
                };

            expect(getters.mapProjection()).to.be.null;
            expect(Getters.mapProjection(state)).to.equals(proj);
        });
        it("returns the positionMapProjection from state", function () {
            const pos = [100, 200],
                state = {
                    positionMapProjection: pos
                };

            expect(getters.positionMapProjection()).to.be.an("array").that.is.empty;
            expect(Getters.positionMapProjection(state)).to.equals(pos);
        });
        it("returns the updatePosition from state", function () {
            const state = {
                updatePosition: false
            };

            expect(getters.updatePosition()).to.be.true;
            expect(Getters.updatePosition(state)).to.be.false;
        });
        it("returns the currentProjectionName from state", function () {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentProjectionName: name2
                };

            expect(getters.currentProjectionName()).to.be.equals(name);
            expect(Getters.currentProjectionName(state)).to.be.equals(name2);
        });
        it("returns the currentProjection from state", function () {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    currentProjection: proj
                };

            expect(getters.currentProjection()).to.be.null;
            expect(Getters.currentProjection(state)).to.equals(proj);
        });
        it("returns the currentSelection from state", function () {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentSelection: name2
                };

            expect(getters.currentSelection()).to.be.equals(name);
            expect(Getters.currentSelection(state)).to.be.equals(name2);
        });
        it("returns the coordinatesEastingField from state", function () {
            const value = "160° 00′ 00″",
                state = {
                    coordinatesEastingField: value
                };

            expect(getters.coordinatesEastingField()).to.be.equals("");
            expect(Getters.coordinatesEastingField(state)).to.be.equals(value);
        });
        it("returns the coordinatesNorthingField from state", function () {
            const value = "100° 00′ 00″ E",
                state = {
                    coordinatesNorthingField: value
                };

            expect(getters.coordinatesNorthingField()).to.be.equals("");
            expect(Getters.coordinatesNorthingField(state)).to.be.equals(value);
        });
    });
    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(getters.name()).to.be.equals("Koordinaten abfragen");
        });
        it("returns the glyphicon default value from state", function () {
            expect(getters.glyphicon()).to.equals("glyphicon-screenshot");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(getters.renderToWindow()).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(getters.resizableWindow()).to.be.true;
        });
        it("returns the isActive default value from state", function () {
            expect(getters.isActive()).to.be.false;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(getters.isVisibleInMenu()).to.be.true;
        });
        it("returns the isRoot default value from state", function () {
            expect(getters.isRoot()).to.be.false;
        });
        it("returns the parentId default value from state", function () {
            expect(getters.parentId()).to.equals("tool");
        });
        it("returns the type default value from state", function () {
            expect(getters.type()).to.equals("tool");
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(getters.deactivateGFI()).to.be.true;
        });

    });
});
