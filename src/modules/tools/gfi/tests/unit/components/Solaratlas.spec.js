import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import SolaratlasTheme from "../../../components/themes/Solaratlas.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/Solaratlas.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SolaratlasTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                            adrfull: "Alstertor 5",
                            area_ek1_p: "0.0",
                            area_ek2_p: "0.0",
                            area_ek3_p: "0.0",
                            area_ek4_p: "307.7",
                            area_pv_m2: "307.7",
                            area_st_1a: "23.9",
                            area_st_2a: "573.2",
                            co2_pv_15: "19.3",
                            ic_mean: "1025.8",
                            p_pv_15: "37.8",
                            p_st_mwh_a: "208.7",
                            powerp_15: "46.0"
                        };
                    }
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });

    it("should render three html elements", () => {
        expect(wrapper.find("h6").exists()).to.be.true;
        expect(wrapper.find("strong").exists()).to.be.true;
        expect(wrapper.find("p").exists()).to.be.true;
    });

    it("should render the html strong tag with text solarPotential", () => {
        expect(wrapper.find("strong").text()).to.equals("modules.tools.gfi.themes.solaratlas.solarPotential");
    });

    it("should render the html p tag with text buildingSuitable for parameter area_pv_m2 > 0", () => {
        expect(wrapper.find("p").text()).to.equals("modules.tools.gfi.themes.solaratlas.buildingSuitable");
    });

    it("should render the html p tag with text buildingUnsuitable for parameter area_pv_m2 === 0.0", () => {
        wrapper = shallowMount(SolaratlasTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                            adrfull: "Alstertor 5",
                            area_ek1_p: "0.0",
                            area_ek2_p: "0.0",
                            area_ek3_p: "0.0",
                            area_ek4_p: "307.7",
                            area_pv_m2: "0.0",
                            area_st_1a: "23.9",
                            area_st_2a: "573.2",
                            co2_pv_15: "19.3",
                            ic_mean: "1025.8",
                            p_pv_15: "37.8",
                            p_st_mwh_a: "208.7",
                            powerp_15: "46.0"
                        };
                    }
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper.find("h6").exists()).to.be.true;
        expect(wrapper.find("strong").exists()).to.be.true;
        expect(wrapper.find("p").exists()).to.be.true;
        expect(wrapper.find("p").text()).to.equals("modules.tools.gfi.themes.solaratlas.buildingUnsuitable");
    });

});
