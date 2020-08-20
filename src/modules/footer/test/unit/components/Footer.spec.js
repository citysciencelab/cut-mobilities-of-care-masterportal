import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FooterComponent from "../../../components/Footer.vue";
import Footer from "../../../store/indexFooter";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;
config.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

describe("Footer.vue", () => {
    const mockConfigJs = {
        footer: {
            urls: [{
                "bezeichnung": "abc",
                "url": "https://abc.de",
                "alias": "ABC",
                "alias_mobil": "ABC"
            }],
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
        const wrapper = shallowMount(FooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find("#footer").exists()).to.be.true;
    });

    it("renders the masterportal version in footer", () => {
        store.commit("Footer/setShowVersion", true);
        const wrapper = shallowMount(FooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find(".hidden-xs").exists()).to.be.true;
    });

    it("renders the urls in footer", async () => {
        const wrapper = shallowMount(FooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find("a").exists()).to.be.true;
        expect(wrapper.find("a").text()).to.equals(store.state.Footer.urls[0].alias);
        expect(wrapper.find("a").attributes().href).to.equals(store.state.Footer.urls[0].url);
    });
});
