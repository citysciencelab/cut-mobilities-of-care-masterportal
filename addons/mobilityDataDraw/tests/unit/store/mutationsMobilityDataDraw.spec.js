import {expect} from "chai";
import mutations from "../../../store/mutationsMobilityDataDraw";

const {applyTranslationKey} = mutations;

describe("addons/mobilityDataDraw/store/mutationsMobilityDataDraw", function () {
    describe("applyTranslationKey", function () {
        it("removes 'translate#' from name if present", function () {
            const state = {
                    name:
                        "translate#additional:modules.tools.MobilityDataDraw.title"
                },
                payload =
                    "translate#additional:modules.tools.MobilityDataDraw.title";

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(
                "additional:modules.tools.MobilityDataDraw.title"
            );
        });

        it("does nothing, if name not starts with 'translate#'", function () {
            const name = "dies ist ein MobilityDataDraw",
                state = {
                    name: name
                },
                payload = name;

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(name);
        });

        it("does nothing, if payload is undefined", function () {
            const name = "name",
                state = {
                    name: name
                },
                payload = undefined;

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(name);
        });
    });
});
