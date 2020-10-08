import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import DataTableTheme from "../../../components/DataTable.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("/src/modules/tools/gfi/components/themes/dataTable/components/DataTable.vue", () => {
    let wrapper;

    const featureData = {
            getTheme: () => "DataTable",
            getTitle: () => "DataTable",
            getAttributesToShow: () => {
                return {};
            },
            getProperties: () => {
                return [{
                    getMappedProperties: () => {
                        return {
                            "Entnahme Datum": "2019",
                            "OHG in Meter": "0.10",
                            "UHG in Meter": "0.35",
                            "Arsen": "15,9",
                            "Cadmium": "1,38",
                            "Chrom": "21,6",
                            "Kupfer": "290,0",
                            "Quecksilber": "0,285",
                            "Nickel": "24,9",
                            "Blei": "289,0",
                            "Thallium": "---",
                            "Zink": "393,0",
                            "Molybdän": "4,53",
                            "Einheit": "mg/kg TM"
                        };
                    }
                },
                {
                    getMappedProperties: () => {
                        return {
                            "Entnahme Datum": "2019",
                            "OHG in Meter": "0.00",
                            "UHG in Meter": "0.10",
                            "Arsen": "14,7",
                            "Cadmium": "1,34",
                            "Chrom": "40,5",
                            "Kupfer": "774,0",
                            "Quecksilber": "0,346",
                            "Nickel": "22,9",
                            "Blei": "209,0",
                            "Thallium": "---",
                            "Zink": "568,0",
                            "Molybdän": "19,8",
                            "Einheit": "mg/kg TM"
                        };
                    }
                }];
            }
        },

        mockGetters = {
            gfiFeatures: () => featureData
        },

        store = new Vuex.Store({
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

    it("Check the displayed table head", () => {
        const theads = wrapper.findAll("#table-data-container table th");

        expect(theads.exists()).to.be.true;

        wrapper.vm.refinedData.head.forEach((singleCaption, index) => {
            expect(theads.at(index).text()).to.equal(singleCaption);
        });
    });

    it("Check the displayed table data", () => {
        const trs = wrapper.findAll("#table-data-container table tr");

        expect(trs.exists()).to.be.true;

        trs.wrappers.forEach((tr, indexTr) => {
            const tds = tr.findAll("td");

            expect(tds.exists()).to.be.true;

            tds.wrappers.forEach((td, indexTd) => {
                expect(td.text()).to.equal(Object.values(wrapper.vm.refinedData.rows[indexTr])[indexTd]);
            });
        });
    });
});
