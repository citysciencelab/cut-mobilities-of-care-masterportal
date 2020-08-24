import {expect} from "chai";
import mutations from "../../../store/mutationsFooter";

const {setShowFooter} = mutations;

describe("mutationsFooter", function () {

    describe("setShowFooter", function () {
        it("set showFooter to true", function () {
            const state = {
                showFooter: false
            };

            setShowFooter(state, true);

            expect(state.showFooter).to.be.true;
        });
    });
});
