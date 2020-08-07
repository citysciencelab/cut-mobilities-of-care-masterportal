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
    isActive,
    isVisibleInMenu,
    isRoot,
    parentId,
    type,
    deactivateGFI} = getters;

describe("gettersScaleSwitcher", function () {
    it("returns the active from state", function () {
        expect(active(stateScaleSwitcher)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(stateScaleSwitcher)).to.equals("scaleSwitcher");
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
        it("returns the isActive default value from state", function () {
            expect(isActive(stateScaleSwitcher)).to.be.false;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateScaleSwitcher)).to.be.true;
        });
        it("returns the isRoot default value from state", function () {
            expect(isRoot(stateScaleSwitcher)).to.be.false;
        });
        it("returns the parentId default value from state", function () {
            expect(parentId(stateScaleSwitcher)).to.equals("tool");
        });
        it("returns the type default value from state", function () {
            expect(type(stateScaleSwitcher)).to.equals("tool");
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateScaleSwitcher)).to.be.false;
        });

    });
});
