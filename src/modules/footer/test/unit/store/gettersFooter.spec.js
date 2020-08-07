import {expect} from "chai";
import Getters from "../../../store/gettersFooter";
import {createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("gettersFooter.vue", () => {
    let getters;

    beforeEach(() => {
        getters = {
            urls: () => [],
            showVersion: () => false
        };
    });


    describe("Footer getters", function () {
        it("returns the urls from state", function () {
            const state = {
                urls: [
                    {
                        "bezeichnung": "Example",
                        "url": "https://example.net",
                        "alias": "Example Alias",
                        "alias_mobil": "EA"
                    }
                ]
            };

            expect(getters.urls()).to.be.an("array").that.is.empty;
            expect(Getters.urls(state)).to.be.an("array").to.equals(state.urls);
        });
        it("returns the showVersion from state", function () {
            const state = {
                showVersion: true
            };

            expect(getters.showVersion()).to.be.false;
            expect(Getters.showVersion(state)).to.be.true;
        });
    });
});
