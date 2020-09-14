import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";


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

describe("ScaleSwitcher", function () {
    describe("ScaleSwitcher getters", function () {
        it("returns the active from state", function () {
            expect(active(stateScaleSwitcher)).to.be.false;
        });
        it("returns the id from state", function () {
            expect(id(stateScaleSwitcher)).to.equals("scaleSwitcher");
        });
    });
    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(stateScaleSwitcher)).to.be.equals("Maßstab umschalten");
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateScaleSwitcher)).to.equals("glyphicon-resize-full");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateScaleSwitcher)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateScaleSwitcher)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateScaleSwitcher)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateScaleSwitcher)).to.be.false;
        });

    });
});
