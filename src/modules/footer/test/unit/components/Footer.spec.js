import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FooterComponent from "../../../components/Footer.vue";
import Footer from "../../../store/indexFooter";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("Footer.vue", () => {
    const mockConfigJs = {
        footer: {
            urls: [],
            showVersion: false
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Footer
            },
            state: {
                configJs: mockConfigJs
            },
            mutations: {
                configJs (state, value) {
                    state.configJs = value;
                }
            }
        });
    });

    it("renders the footer", () => {
        const wrapper = shallowMount(FooterComponent, {store, localVue});

        expect(wrapper.find("#footer").exists()).to.be.true;
    });

    // it("do not render the footer select if not active", () => {
    //     store.commit("showFooter", false);
    //     const wrapper = shallowMount(FooterComponent, {store, localVue});

    //     expect(wrapper.find("#footer").exists()).to.be.false;
    // });

});
