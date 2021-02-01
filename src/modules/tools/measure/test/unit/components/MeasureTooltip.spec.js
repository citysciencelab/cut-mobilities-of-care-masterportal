import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

import MeasureTooltipComponent from "../../../components/MeasureTooltip.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/measure/components/MeasureTooltip.vue", () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Measure: {
                            namespaced: true,
                            getters: {
                                lines: () => ({lineId: {
                                    get: key => ({
                                        isBeingDrawn: true
                                    })[key]
                                }}),
                                polygons: () => ({polygonId: {
                                    get: key => ({
                                        isBeingDrawn: false
                                    })[key]
                                }}),
                                lineLengths: () => ({lineId: "500 m"}),
                                polygonAreas: () => ({polygonId: "500 m²"})
                            }
                        }
                    }
                }
            }
        });
    });

    it("renders the measure tooltip with the measured value", () => {
        const wrapper = shallowMount(MeasureTooltipComponent, {
            store,
            localVue,
            propsData: {featureId: "lineId"}
        });

        expect(wrapper.find(".measure-tooltip").exists()).to.be.true;
        expect(wrapper.text()).to.contain("500 m");
    });

    it("renders a tooltip for features currently being drawn", () => {
        const wrapper = shallowMount(MeasureTooltipComponent, {
            store,
            localVue,
            propsData: {featureId: "lineId"}
        });

        expect(wrapper.text()).to.contain("modules.tools.measure.finishWithDoubleClick");
    });

    it("does not render tooltips for finished features", () => {
        const wrapper = shallowMount(MeasureTooltipComponent, {
            store,
            localVue,
            propsData: {featureId: "polygonId"}
        });

        expect(wrapper.text()).not.to.contain("modules.tools.measure.finishWithDoubleClick");
    });
});
