import {expect} from "chai";
import mutations from "../../../store/mutationsFooter";

const {setShowFooter} = mutations;

describe("src/modules/footer/store/mutationsFooter.js", () => {
    describe("setShowFooter", () => {
        it("set showFooter to true", () => {
            const state = {
                showFooter: false
            };

            setShowFooter(state, true);

            expect(state.showFooter).to.be.true;
        });
    });
});
