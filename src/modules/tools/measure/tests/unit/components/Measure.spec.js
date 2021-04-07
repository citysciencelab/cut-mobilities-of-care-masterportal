import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import MeasureComponent from "../../../components/Measure.vue";
import MeasureModule from "../../../store/indexMeasure";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/measure/components/Measure.vue", () => {
    let store;

    beforeEach(() => {
        MeasureModule.actions.createDrawInteraction = sinon.spy(MeasureModule.actions.createDrawInteraction);
        MeasureModule.actions.removeDrawInteraction = sinon.spy(MeasureModule.actions.removeDrawInteraction);
        MeasureModule.actions.deleteFeatures = sinon.spy(MeasureModule.actions.deleteFeatures);
        MeasureModule.mutations.setSelectedGeometry = sinon.spy(MeasureModule.mutations.setSelectedGeometry);
        MeasureModule.mutations.setSelectedUnit = sinon.spy(MeasureModule.mutations.setSelectedUnit);

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Map: {
                    namespaced: true,
                    getters: {
                        layerById: () => id => ({})[id],
                        is3d: () => false,
                        map: () => ({
                            addInteraction: sinon.spy(),
                            removeInteraction: sinon.spy()
                        })
                    },
                    mutations: {
                        addLayerToMap: sinon.spy(),
                        setActive: sinon.spy()
                    }
                },
                Tools: {
                    namespaced: true,
                    modules: {
                        Measure: MeasureModule
                    }
                }
            },
            getters: {
                isTableStyle: () => false,
                isDefaultStyle: () => true
            }
        });

        store.commit("Tools/Measure/setActive", true);
    });

    it("renders the measure tool with the expected form fields", () => {
        const wrapper = shallowMount(MeasureComponent, {store, localVue});

        expect(wrapper.find("#measure").exists()).to.be.true;
        expect(wrapper.find("#measure-tool-geometry-select").exists()).to.be.true;
        expect(wrapper.find("#measure-tool-unit-select").exists()).to.be.true;
        expect(wrapper.find(".inaccuracy-list").exists()).to.be.true;
        expect(wrapper.find("#measure-delete").exists()).to.be.true;
    });

    it("creates a draw interaction on mount when initially active", () => {
        shallowMount(MeasureComponent, {store, localVue});

        expect(MeasureModule.actions.createDrawInteraction.calledOnce).to.be.true;
        expect(MeasureModule.actions.removeDrawInteraction.calledOnce).to.be.true;
    });

    it("select element interaction produces expected mutations, actions, and updates", async () => {
        const wrapper = shallowMount(MeasureComponent, {store, localVue}),
            geometrySelect = wrapper.find("#measure-tool-geometry-select"),
            unitSelect = wrapper.find("#measure-tool-unit-select");

        // form initially "LineString" with m/km
        expect(geometrySelect.element.value).equals("LineString");
        expect(unitSelect.text())
            .to.contain("m")
            .and.to.contain("km")
            .and.not.to.contain("²");

        // select "Polygon" geometry
        geometrySelect.element.value = "Polygon";
        geometrySelect.trigger("change");
        await wrapper.vm.$nextTick();
        expect(MeasureModule.mutations.setSelectedGeometry.calledOnce).to.be.true;

        // draw interaction should have been remade on geometry change
        expect(MeasureModule.actions.createDrawInteraction.calledTwice).to.be.true;
        expect(MeasureModule.actions.removeDrawInteraction.calledTwice).to.be.true;

        // after changing to "Polygon", m²/km² are the units
        expect(geometrySelect.element.value).equals("Polygon");
        expect(unitSelect.text())
            .to.contain("m²")
            .and.to.contain("km²");

        // check if changing unit produces expected effects
        expect(unitSelect.element.value).equals("0");
        unitSelect.element.value = "1";
        unitSelect.trigger("change");
        await wrapper.vm.$nextTick();
        expect(unitSelect.element.value).equals("1");
        expect(MeasureModule.mutations.setSelectedUnit.calledOnce).to.be.true;

        // no further draw interaction recreation should have happened
        expect(MeasureModule.actions.createDrawInteraction.calledTwice).to.be.true;
        expect(MeasureModule.actions.removeDrawInteraction.calledTwice).to.be.true;
    });

    it("clicking delete will call the appropriate action", async () => {
        const wrapper = shallowMount(MeasureComponent, {store, localVue}),
            deleteButton = wrapper.find("#measure-delete");

        deleteButton.trigger("click");
        expect(MeasureModule.actions.deleteFeatures.calledOnce).to.be.true;
    });

    it("createDrawInteraction should not called if active is false and setSelectedGeometry is changend", async () => {
        store.commit("Tools/Measure/setActive", false);

        const wrapper = shallowMount(MeasureComponent, {store, localVue});

        store.commit("Tools/Measure/setSelectedGeometry", "123");
        await wrapper.vm.$nextTick;

        expect(MeasureModule.actions.createDrawInteraction.called).to.be.false;
    });
});
