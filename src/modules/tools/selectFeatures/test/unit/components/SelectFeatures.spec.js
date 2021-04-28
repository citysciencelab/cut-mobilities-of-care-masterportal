import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SelectFeaturesComponent from "../../../components/SelectFeatures.vue";
import SelectFeaturesModule from "../../../store/indexSelectFeatures";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/selectFeatures/components/SelectFeatures.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            "selectFeatures":
                            {
                                "name": "translate#common:menu.tools.selectFeatures"
                            }
                        }
                    }
                }
            }
        },
        mockMapActions = {
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub()
        };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Map: {
                    namespaced: true,
                    actions: mockMapActions
                },
                Tools: {
                    namespaced: true,
                    modules: {
                        SelectFeatures: SelectFeaturesModule
                    }
                }
            },
            getters: {
                uiStyle: () => true
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/SelectFeatures/setActive", true);
    });

    it("renders the SelectFeatures tool if active", () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.find("#selectFeatures").exists()).to.be.true;
        expect(wrapper.find(".selectFeaturesDefaultMessage").exists()).to.be.true;
    });

    it("do not render the SelectFeatures tool if not active", async () => {
        const spyRemoveInteractions = sinon.spy(SelectFeaturesComponent.methods, "removeInteractions"),
            wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        await store.commit("Tools/SelectFeatures/setActive", false);
        expect(spyRemoveInteractions.calledOnce).to.be.true;

        expect(wrapper.find("#selectFeatures").exists()).to.be.false;

        spyRemoveInteractions.restore();
    });
});
