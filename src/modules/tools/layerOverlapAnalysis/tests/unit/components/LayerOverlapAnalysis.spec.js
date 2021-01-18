import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LayerOverlapAnalysisComponent from "../../../components/LayerOverlapAnalysis.vue";
import LayerOverlapAnalysis from "../../../store/indexLayerOverlapAnalysis";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe.only("src/modules/tools/layerOverlapAnalysis/components/LayerOverlapAnalysis.vue", () => {
    const mockMapGetters = {
        },
        mockMapActions = {
            checkIntersection: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            layerOverlapAnalysis:
                            {
                                "name": "translate#common:menu.tools.layerOverlapAnalysis",
                                "glyphicon": "glyphicon-random"
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
                        LayerOverlapAnalysis
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/LayerOverlapAnalysis/setActive", true);
    });

    it("renders the layerOverlapAnalysis", () => {
        const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue});

        expect(wrapper.find("#layer-analysis").exists()).to.be.true;
    });

    it("do not render the layerOverlapAnalysiss select if not active", () => {
        store.commit("Tools/LayerOverlapAnalysis/setActive", false);
        const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue});

        expect(wrapper.find("#layer-analysis").exists()).to.be.false;
    });

    // it("has initially set all scales to select", () => {
    //     const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
    //         options = wrapper.findAll("option");
    //
    //     expect(options.length).to.equal(scales.length);
    //     scales.forEach((scale, index) => {
    //         expect(scale).to.equal(options.at(index).attributes().value);
    //     });
    // });
    //
    // it("has initially selected scale", async () => {
    //     const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
    //         select = wrapper.find("select");
    //
    //     expect(select.element.value).to.equals("1000");
    // });
    //
    // it("renders the correct value when select is changed", async () => {
    //     const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
    //         select = wrapper.find("select"),
    //         options = wrapper.findAll("option");
    //
    //     select.setValue(options.at(1).element.value);
    //     await wrapper.vm.$nextTick();
    //     expect(wrapper.find("select").element.value).to.equals("5000");
    //     select.setValue(options.at(2).element.value);
    //     await wrapper.vm.$nextTick();
    //     expect(wrapper.find("select").element.value).to.equals("10000");
    // });
    //
    //
    // it("calls store action setResolutionByIndex when select is changed", async () => {
    //     const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
    //         select = wrapper.find("select"),
    //         options = wrapper.findAll("option");
    //
    //     mockMapActions.setResolutionByIndex.reset();
    //     select.setValue(options.at(2).element.value);
    //     await wrapper.vm.$nextTick();
    //     expect(mockMapActions.setResolutionByIndex.calledOnce).to.equal(true);
    // });
    //
    // it("method close sets active to false", async () => {
    //     const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue});
    //
    //     wrapper.vm.close();
    //     await wrapper.vm.$nextTick();
    //
    //     expect(store.state.Tools.LayerOverlapAnalysis.active).to.be.false;
    //     expect(wrapper.find("#layer-analysis").exists()).to.be.false;
    // });


});
