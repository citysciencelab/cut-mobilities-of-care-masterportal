import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import KmlImportComponent from "../../../components/KmlImport.vue";
import KmlImport from "../../../store/indexKmlImport";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("KmlImport.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            kmlimport:
                            {
                                "title": "translate#common:menu.tools.kmlImport",
                                "glyphicon": "glyphicon-resize-full",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };

    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        KmlImport
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.dispatch("Tools/KmlImport/setActive", true);
    });

    it("renders the kmlImport", () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        expect(wrapper.find("#kml-import").exists()).to.be.true;
    });

    it("do not render the kmlImport tool if not active", () => {
        store.dispatch("Tools/KmlImport/setActive", false);
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        expect(wrapper.find("#kml-import").exists()).to.be.false;
    });

    it("import method is initially set to \"auto\"", () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        expect(wrapper.vm.selectedFiletype).to.equal("auto");
    });
});
