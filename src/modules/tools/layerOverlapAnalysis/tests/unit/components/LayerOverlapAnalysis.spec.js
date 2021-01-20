import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LayerOverlapAnalysisComponent from "../../../components/LayerOverlapAnalysis.vue";
import LayerOverlapAnalysis from "../../../store/indexLayerOverlapAnalysis";
import {expect} from "chai";
import sinon from "sinon";
import Layer from "../../../../../../../modules/core/modelList/layer/model";

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

    it("has initially set nothing to layer-analysis-select", () => {
        const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
            select = wrapper.find("#layer-analysis-select");

        expect(select.element.value).to.equals("");
    });

    it("has initially set two available options to select", async () => {
        const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
            layers = [];
        let options = [];

        for (let i = 0; i <= 2; i++) {
            const layer = new Layer();

            layer.set("name", "Layer" + i);
            layer.set("id", i);
            layers.push(layer);
        }

        await store.commit("Tools/LayerOverlapAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equals(8); // 2 * 3 (selectOptions) + 2 (inputResultType)
    });

    it("sets selected to layer when it is selected via input", async () => {
        const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
            select = wrapper.find("#layer-analysis-select"),
            layers = [];

        for (let i = 0; i <= 2; i++) {
            const layer = new Layer();

            layer.set("name", "Layer" + i);
            layer.set("id", i);
            sinon.stub(layer, "setIsSelected");
            layers.push(layer);
        }

        await store.commit("Tools/LayerOverlapAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();
        select.setValue(layers[0]);
        await wrapper.vm.$nextTick();
        expect(layers[0].setIsSelected.calledOnce).to.equal(true);
        select.setValue(layers[2]);
        await wrapper.vm.$nextTick();
        expect(layers[2].setIsSelected.calledTwice).to.equal(true);
    });


    it("renders the correct value when select is changed", async () => {
        const wrapper = shallowMount(LayerOverlapAnalysisComponent, {store, localVue}),
            select = wrapper.find("#layer-analysis-select"),
            options = select.findAll("option"),
            layers = [];

        for (let i = 0; i <= 2; i++) {
            const layer = new Layer();

            layer.set("name", "Layer" + i);
            layer.set("id", i);
            sinon.stub(layer, "setIsSelected");
            layers.push(layer);
        }

        await store.commit("Tools/LayerOverlapAnalysis/setSelectOptions", layers);

        options.at(1).setSelected();

        await wrapper.vm.$nextTick();
        // console.log(wrapper.get("sourceLayerSelection"));
        // expect(wrapper.get("sourceLayerSelection")).to.eql(layers[0]);
        // select.setValue(layers[2]);
        // await wrapper.vm.$nextTick();
        // expect(select.element.innerHTML).to.equals("Layer2");
    });
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
