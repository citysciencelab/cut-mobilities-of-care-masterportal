import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FileImportComponent from "../../../components/FileImport.vue";
import FileImport from "../../../store/indexFileImport";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/fileImport/components/FileImport.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            fileImport:
                            {
                                "name": "translate#common:menu.tools.fileImport",
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
                        FileImport
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/FileImport/setActive", true);
    });

    it("renders the fileImport", () => {
        const wrapper = shallowMount(FileImportComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.true;
    });

    it("do not render the fileImport tool if not active", () => {
        store.commit("Tools/FileImport/setActive", false);
        const wrapper = shallowMount(FileImportComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.false;
    });

    it("import method is initially set to \"auto\"", () => {
        const wrapper = shallowMount(FileImportComponent, {store, localVue});

        expect(wrapper.vm.selectedFiletype).to.equal("auto");
    });
});
