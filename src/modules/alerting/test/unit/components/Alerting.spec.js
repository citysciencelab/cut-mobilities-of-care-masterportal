import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import AlertingComponent from "../../../components/Alerting.vue";
import AlertingStoreModule from "../../../store/indexAlerting";
import {expect} from "chai";
import sinon from "sinon";

// global.navigator = {
//   userAgent: 'node',
// }

global.window = {}

import 'mock-local-storage'


window.localStorage = global.localStorage

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;
config.mocks.localStorage = window.localStorage;
config.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

describe("src/modules/alerting/components/Alerting.vue", () => {
    const mockConfigJs = {
        alerting: {
            fetchBroadcastUrl: "foo",
            localStorageDisplayedAlertsKey: "bar"
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                AlertingStoreModule
            },
            state: {
                configJs: mockConfigJs
            },
            mutations: {
                configJs (state, value) {
                    state.configJs = value;
                }
            },
            methods: {
                fetchBroadcast: function (url) {
                    return {
                      "globalAlerts": ["Test1", "Test4"],

                      "restrictedAlerts": {
                        "https://localhost:9001/portal/master/": ["Test2"],
                        "https://localhost:9001/portal/basic/": ["Test3"]
                      },

                      "alerts": {
                        "Test1": {
                          "category": "Test 1",
                          "content": "Lorem Ipsum 1 (global content)",
                          "displayFrom": "2020-03-01 20:15:55",
                          "displayUntil": "2022-05-17 14:30",
                          "mustBeConfirmed": true,
                          "once": {"seconds": 15}
                        },
                        "Test2": {
                          "category": "Test 1",
                          "content": "Lorem Ipsum 2 (content for master)",
                          "displayFrom": false,
                          "displayUntil": "2022-05-17 14:30",
                          "mustBeConfirmed": true,
                          "once": {"seconds": 30}
                        },
                        "Test3": {
                          "category": "Test 2",
                          "content": "Lorem Ipsum 3 (content for basic)",
                          "displayFrom": false,
                          "displayUntil": "2022-05-17 14:30",
                          "mustBeConfirmed": true,
                          "once": {"seconds": 45}
                        },
                        "Test4": {
                          "category": "Test 2",
                          "content": "Lorem Ipsum 4 (global content)",
                          "displayFrom": false,
                          "displayUntil": "2022-05-17 14:30",
                          "mustBeConfirmed": true,
                          "once": {"seconds": 60}
                        }
                      }
                    };
                }
            }
        });
    });

    it("initial broadcast fetching", () => {
        const wrapper = shallowMount(AlertingComponent, {
            store,
            computed: {
                currentUrl: () => "urlForTesting"
            },
            localVue
        });

        expect(wrapper.find("#modal-1-inner-wrapper").exists()).to.be.true;
    });


    /*
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

        store.commit("Footer/setShowFooter", false);

        await wrapper.vm.$nextTick();
        expect(wrapper.find("scaleline-stub").exists()).to.be.true;
        expect(wrapper.find("scaleline-stub").classes()).to.includes("footer-scaleLine");
    });
    */
});
