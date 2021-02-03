import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import BufferAnalysisComponent from "../../../components/BufferAnalysis.vue";
import BufferAnalysis from "../../../store/indexBufferAnalysis";
import {expect} from "chai";
import sinon from "sinon";
import Layer from "../../../../../../../modules/core/modelList/layer/model";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe.only("src/modules/tools/bufferAnalysis/components/BufferAnalysis.vue", () => {
    const mockMapGetters = {
            map: () => ({removeLayer: sinon.spy()})
        },
        mockMapActions = {
            // checkIntersection: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            bufferAnalysis:
                            {
                                "name": "translate#common:menu.tools.bufferAnalysis",
                                "glyphicon": "glyphicon-random"
                            }
                        }
                    }
                }
            }
        };
    let store;

    beforeEach(() => {

        BufferAnalysis.actions.checkIntersection = sinon.spy();
        BufferAnalysis.actions.applyBufferRadius = sinon.spy();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        BufferAnalysis
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
        store.commit("Tools/BufferAnalysis/setActive", true);
    });

    it("renders the bufferAnalysis", () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue});

        expect(wrapper.find("#layer-analysis").exists()).to.be.true;
    });

    it("do not render the bufferAnalysiss select if not active", () => {
        store.commit("Tools/BufferAnalysis/setActive", false);
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue});

        expect(wrapper.find("#layer-analysis").exists()).to.be.false;
    });

    it("has initially set nothing to layer-analysis-select", () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
            select = wrapper.find("#layer-analysis-select");

        expect(select.element.value).to.equals("");
    });

    it("has initially set eight available options to select", async () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
            layers = [];
        let options = [];

        for (let i = 0; i <= 2; i++) {
            const layer = new Layer(); // javascript object

            layer.set("name", "Layer" + i);
            layer.set("id", i);
            layers.push(layer);
        }

        await store.commit("Tools/BufferAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equals(8); // 2 * 3 (selectOptions) + 2 (inputResultType)
    });

    it("sets selected to layer when it is selected via input", async () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
            select = wrapper.find("#layer-analysis-select"),
            layers = [];

        for (let i = 0; i <= 2; i++) {
            const layer = new Layer(); // javascript object Testen: {setIsSelected: sinon.spy()}

            layer.set("name", "Layer" + i);
            layer.set("id", i);
            sinon.stub(layer, "setIsSelected").callsFake(sinon.spy());
            layers.push(layer);
        }

        await store.commit("Tools/BufferAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();
        select.setValue(layers[0]);
        await wrapper.vm.$nextTick();
        expect(layers[0].setIsSelected.calledOnce).to.equal(true);
        select.setValue(layers[2]);
        await wrapper.vm.$nextTick();
        expect(layers[2].setIsSelected.calledTwice).to.equal(true);
    });

    // it("bla", async (done) => {
    //     const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
    //         select = wrapper.find("#layer-analysis-select"),
    //         select2 = wrapper.find("#layer-analysis-select-target"),
    //         input = wrapper.find("#layer-analysis-range"),
    //         layers = [];
    //
    //     for (let i = 0; i <= 2; i++) {
    //         const layer = new Layer(); // javascript object Testen: {setIsSelected: sinon.spy()}
    //
    //         layer.set("name", "Layer" + i);
    //         layer.set("id", i);
    //         sinon.stub(layer, "setIsSelected").callsFake(sinon.spy());
    //         layers.push(layer);
    //     }
    //
    //     await store.commit("Tools/BufferAnalysis/setSelectOptions", layers);
    //     await wrapper.vm.$nextTick();
    //     select.setValue(layers[0]);
    //     input.setValue(2000);
    //     select2.setValue(layers[2]);
    //     await wrapper.vm.$nextTick();
    //     setTimeout(() => {
    //         expect(BufferAnalysis.actions.checkIntersection.calledOnce).to.equal(true);
    //         done();
    //     }, 1500);
    // });


    it("renders the correct value when select is changed", async () => {
        // const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
        // select = wrapper.find("#layer-analysis-select"),
        // options = select.findAll("option"),
        // layers = [];

        for (let i = 0; i <= 2; i++) {
            const layer = new Layer();

            layer.set("name", "Layer" + i);
            layer.set("id", i);
            sinon.stub(layer, "setIsSelected");
            // layers.push(layer);
        }

        // await store.commit("Tools/BufferAnalysis/setSelectOptions", layers);

        // geometrySelect.element.value = "Polygon";
        // geometrySelect.trigger("change");
        // options.at(1).setSelected();

        // select.element.value = layers[0];
        // select.trigger("change");

        // await wrapper.vm.$nextTick();
        // console.log(wrapper.computed.selectedSourceLayer);
        // expect(wrapper.computed.selectedSourceLayer).to.eql(layers[0]);
        // select.setValue(layers[2]);
        // await wrapper.vm.$nextTick();
        // expect(select.element.innerHTML).to.equals("Layer2");
    });

    //
    // it("calls store action setResolutionByIndex when select is changed", async () => {
    //     const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
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
    //     const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue});
    //
    //     wrapper.vm.close();
    //     await wrapper.vm.$nextTick();
    //
    //     expect(store.state.Tools.BufferAnalysis.active).to.be.false;
    //     expect(wrapper.find("#layer-analysis").exists()).to.be.false;
    // });
});
