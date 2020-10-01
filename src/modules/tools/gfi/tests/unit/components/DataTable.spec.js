import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import {mapGetters, mapMutations} from "vuex";
import DataTableTheme from "../../../components/themes/DataTable.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/DataTable.vue", () => {
    let wrapper;

    const featureData = [
        {
            getMappedProperties: function () {
                return {};
            },
            getTheme: () => "DataTable",
            getTitle: () => "DataTable",
            getAttributesToShow: function () {
                return {
                    "arsen": "Arsen",
                    "blei": "Blei",
                    "cadmium": "Cadmium",
                    "chrom": "Chrom",
                    "einheit": "Einheit",
                    "entnahme_datum": "Entnahme Datum",
                    "geom": "geom",
                    "kupfer": "Kupfer",
                    "molybdaen": "Molybdän",
                    "nickel": "Nickel",
                    "ohg_in_meter": "OHG in Meter",
                    "quecksilber": "Quecksilber",
                    "thallium": "Thallium",
                    "uhg_in_meter": "UHG in Meter",
                    "zink": "Zink"
                };
            },
            getProperties: function () {
                return {
                    "arsen": "4,63",
                    "blei": "25,5",
                    "cadmium": "0,245",
                    "chrom": "11,4",
                    "einheit": "mg/kg TM",
                    "entnahme_datum": "2019",
                    "kupfer": "28,2",
                    "molybdaen": "1,29",
                    "nickel": "6,08",
                    "ohg_in_meter": "0.00",
                    "quecksilber": "---",
                    "thallium": "---",
                    "uhg_in_meter": "0.10",
                    "zink": "79,4"
                };
            }
        },
        {
            getMappedProperties: function () {
                return {};
            },
            getTheme: () => "DataTable",
            getTitle: () => "DataTable",
            getAttributesToShow: function () {
                return {
                    "arsen": "Arsen",
                    "blei": "Blei",
                    "cadmium": "Cadmium",
                    "chrom": "Chrom",
                    "einheit": "Einheit",
                    "entnahme_datum": "Entnahme Datum",
                    "geom": "geom",
                    "kupfer": "Kupfer",
                    "molybdaen": "Molybdän",
                    "nickel": "Nickel",
                    "ohg_in_meter": "OHG in Meter",
                    "quecksilber": "Quecksilber",
                    "thallium": "Thallium",
                    "uhg_in_meter": "UHG in Meter",
                    "zink": "Zink"
                };
            },
            getProperties: function () {
                return {
                    "arsen": "4,89",
                    "blei": "24,1",
                    "cadmium": "0,248",
                    "chrom": "11,6",
                    "einheit": "mg/kg TM",
                    "entnahme_datum": "2019",
                    "kupfer": "19,9",
                    "molybdaen": "0,996",
                    "nickel": "6,18",
                    "ohg_in_meter": "0.10",
                    "quecksilber": "---",
                    "thallium": "---",
                    "uhg_in_meter": "0.35",
                    "zink": "71,3"
                };
            }
        }        
    ];

    const mockGetters = {
        gfiFeatures: () => featureData
    };

    const store = new Vuex.Store({
            namespaces: true,
            modules: {
                Map: {
                    namespaced: true,
                    getters: mockGetters
                }
            }
        });


    beforeEach(() => {
        wrapper = shallowMount(DataTableTheme, {
            store,
            localVue,
            propsData: {
                feature: featureData
            }
        });
    });

    it("It should exist a container for a data table", () => {
        
        expect(wrapper.find("#table-data-container").exists()).to.be.true;
    });
});
