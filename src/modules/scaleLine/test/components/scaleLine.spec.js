import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleLine from "../../../../../src/modules/scaleLine/components/ScaleLine.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

// Test the ScaleLine component
describe("ScaleLine.vue", () => {
    let wrapper;

    it("check mapMode normal -> do render", () => {
        wrapper = createWrapper(false, 0, "1 : 60.000", "1.2 km");

        expect(wrapper.find("#scales").exists()).to.equal(true);
        expect(wrapper.find(".scale-line").text()).to.equals("1.2 km");
        expect(wrapper.find(".scale-as-a-ratio").text()).to.equals("1 : 60.000");
    });

    it("check mapMode Oblique -> do not render", () => {
        wrapper = createWrapper(false, "Oblique", "1 : 60.000", "1.2 km");

        expect(wrapper.find("#scales").exists()).to.equal(false);
    });

    it("check mobile=true -> do not render", () => {
        wrapper = createWrapper(true, 0, "1 : 60.000", "1.2 km");

        expect(wrapper.find("#scales").exists()).to.equal(false);
    });

    // TEARDOWN - run after to each unit test
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    /**
     * Helper Function to create a wrapper.
     * @param {*} mobile getter mobile
     * @param {*} mapMode getter mapMode
     * @param {*} scaleToOne  getter scaleToOne
     * @param {*} scaleWithUnit  getter scaleWithUnit
     * @return {Object} the shallowMounted wrapper
     */
    function createWrapper (mobile, mapMode, scaleToOne, scaleWithUnit) {
        return shallowMount(ScaleLine, {
            computed: {
                mobile: () => mobile,
                mapMode: () => mapMode,
                scaleToOne: () => scaleToOne,
                scaleWithUnit: () => scaleWithUnit
            },
            localVue
        });
    }

});
