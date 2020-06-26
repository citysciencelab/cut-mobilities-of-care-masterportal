import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";


const {currentScale, renderToWindow, isActive, glyphicon} = getters;

describe("gettersScaleSwitcher", function () {
    // QUESTION: die getters werden alle mit dem generator erzeugt, brauchen sie dann Tests?
    // NOTE: Sinn macht es getters zu testen, die etwas verändern oder nicht direkt den state zurück liefern
    describe("getCurrentScale", function () {
        it("returns the scale from state", function () {
            const state = {
                currentScale: "1000"
            };

            expect(currentScale(state)).to.equals("1000");
        });
    });
    // QUESTION: macht es Sinn die default-Values zu testen?
    describe("testing default values", function () {
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateScaleSwitcher)).to.be.true;
        });
        it("returns the isActive default value from state", function () {
            expect(isActive(stateScaleSwitcher)).to.be.false;
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateScaleSwitcher)).to.equals("glyphicon-resize-full");
        });

    });
});
