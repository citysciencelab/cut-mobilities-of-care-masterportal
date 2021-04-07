import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FooterComponent from "../../../components/Footer.vue";
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

describe("src/modules/footer/components/Footer.vue", () => {
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
            namespaced: true,
            modules: {
                Footer: {
                    namespaced: true,
                    getters: {
                        showFooter: () => true,
                        urls: () => [{
                            "bezeichnung": "abc",
                            "url": "https://abc.de",
                            "alias": "ABC",
                            "alias_mobil": "ABC"
                        }],
                        showVersion: () => true
                    },
                    mutations: {
                        setShowFooter: () => sinon.stub()
                    }
                }
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
        expect(wrapper.find("a").text()).to.equals("ABC");
        expect(wrapper.find("a").attributes().href).to.equals("https://abc.de");
    });

    it("renders scaleLine exist", async () => {
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
        expect(wrapper.find("scaleline-stub").exists()).to.be.true;
        expect(wrapper.find("scaleline-stub").classes()).to.not.includes("footer-scaleLine");
    });
    it("renders scaleLine exist", () => {
        const wrapper = shallowMount(FooterComponent, {
            store: new Vuex.Store({
                namespaced: true,
                modules: {
                    Footer: {
                        namespaced: true,
                        getters: {
                            showFooter: () => false,
                            urls: () => [{
                                "bezeichnung": "abc",
                                "url": "https://abc.de",
                                "alias": "ABC",
                                "alias_mobil": "ABC"
                            }],
                            showVersion: () => true
                        },
                        mutations: {
                            setShowFooter: () => sinon.stub()
                        }
                    }
                },
                state: {
                    configJs: mockConfigJs
                },
                mutations: {
                    configJs (state, value) {
                        state.configJs = value;
                    }
                }
            }),
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find("scaleline-stub").exists()).to.be.true;
        expect(wrapper.find("scaleline-stub").classes()).to.includes("footer-scaleLine");
    });
});
