import {expect} from "chai";
import mutations from "../../../store/mutationsScaleSwitcher";


const {setCurrentScale} = mutations;

describe("mutationsScaleSwitcher", function () {
    describe("setCurrentScale", function () {
        it("sets the scale to state", function () {
            const state = {
                    currentScale: null
                },
                payload = "1000";

            setCurrentScale(state, payload);
            expect(state.currentScale).to.equals("1000");
        });
    });
});
