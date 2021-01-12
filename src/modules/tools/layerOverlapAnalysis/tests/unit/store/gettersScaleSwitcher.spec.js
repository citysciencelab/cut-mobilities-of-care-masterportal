import {expect} from "chai";
import getters from "../../../store/gettersLayerOverlapAnalysis";
import stateLayerOverlapAnalysis from "../../../store/stateLayerOverlapAnalysis";


const {
    active,
    id,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI
} = getters;

describe("src/modules/tools/layerOverlapAnalysis/store/gettersLayerOverlapAnalysis.js", () => {
    describe("LayerOverlapAnalysis getters", () => {
        it("returns the active from state", () => {
            expect(active(stateLayerOverlapAnalysis)).to.be.false;
        });
        it("returns the id from state", () => {
            expect(id(stateLayerOverlapAnalysis)).to.equals("layerOverlapAnalysis");
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(name(stateLayerOverlapAnalysis)).to.be.equals("Layer-Überschneidung analysieren");
        });
        it("returns the glyphicon default value from state", () => {
            expect(glyphicon(stateLayerOverlapAnalysis)).to.equals("glyphicon-resize-full");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(renderToWindow(stateLayerOverlapAnalysis)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(resizableWindow(stateLayerOverlapAnalysis)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(isVisibleInMenu(stateLayerOverlapAnalysis)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(deactivateGFI(stateLayerOverlapAnalysis)).to.be.false;
        });
    });
});
