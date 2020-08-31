import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LegendMenuComponent from "../../../components/LegendMenu.vue";
import Legend from "../../../store/indexLegend";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("LegendMenu.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                legend: {
                    name: "common:modules.legend.name",
                    glyphicon: "glyphicon-book",
                    showCollapseAllButton: true
                }
            }
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Legend
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });

    it("renders the legend in Menu", () => {
        const wrapper = shallowMount(LegendMenuComponent, {store, localVue});

        expect(wrapper.find("#legend-menu").exists()).to.be.true;
        wrapper.destroy();
    });

});
