import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import DataTableTheme from "../../../components/themes/DataTable.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/DataTable.vue", () => {
    let wrapper;

    const expectedUsedKeys = [],
        featureData = [{
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
        }],
        expectedUsedCaptions = [],
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

    featureData.forEach(singleFeature => {
        const attributesToShow = singleFeature.getAttributesToShow();

        Object.keys(singleFeature.getProperties()).forEach(propKey => {
            if (expectedUsedKeys.indexOf(propKey) === -1 && attributesToShow[propKey] !== undefined) {
                expectedUsedKeys.push(propKey);
                expectedUsedCaptions.push(attributesToShow[propKey]);
            }
        });
    });

    beforeEach(() => {
        wrapper = shallowMount(DataTableTheme, {
            store,
            localVue,
            propsData: {
                feature: featureData[0]
            }
        });
    });

    it("It should exist a container for a data table", () => {
        expect(wrapper.find("#table-data-container").exists()).to.be.true;
    });

    it("Check the displayed table head", () => {
        const theads = wrapper.findAll("#table-data-container table th");

        expect(theads.exists()).to.be.true;

        expectedUsedCaptions.forEach((singleCaption, index) => {
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
                expect(td.text()).to.equal(featureData[indexTr].getProperties()[expectedUsedKeys[indexTd]]);
            });
        });
    });
});
