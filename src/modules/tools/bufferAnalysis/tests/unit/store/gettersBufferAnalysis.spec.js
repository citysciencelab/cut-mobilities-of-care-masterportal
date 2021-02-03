import {expect} from "chai";
import getters from "../../../store/gettersBufferAnalysis";
import stateBufferAnalysis from "../../../store/stateBufferAnalysis";


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

describe("src/modules/tools/bufferAnalysis/store/gettersBufferAnalysis.js", () => {
    describe("BufferAnalysis getters", () => {
        it("returns the active from state", () => {
            expect(active(stateBufferAnalysis)).to.be.false;
        });
        it("returns the id from state", () => {
            expect(id(stateBufferAnalysis)).to.equals("bufferAnalysis");
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(name(stateBufferAnalysis)).to.be.equals("Layer-Überschneidung analysieren");
        });
        it("returns the glyphicon default value from state", () => {
            expect(glyphicon(stateBufferAnalysis)).to.equals("glyphicon-resize-full");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(renderToWindow(stateBufferAnalysis)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(resizableWindow(stateBufferAnalysis)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(isVisibleInMenu(stateBufferAnalysis)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(deactivateGFI(stateBufferAnalysis)).to.be.false;
        });
    });
});
