import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import TrafficCountCompTable from "../../components/TrafficCountCompTable.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/trafficCount/components/TrafficCountCompTable.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(TrafficCountCompTable, {
            localVue,
            propsData: {
                apiData: [
                    {
                        truck: {date3: "value3", date33: "value33"},
                        car: {date2: "value2", date22: null},
                        bike: {date1: "value1"}
                    },
                    {
                        car: {date5: "value5"},
                        truck: {date6: "value6"},
                        bike: {date4: "value4"}
                    },
                    {
                        car: {date8: "value8"},
                        bike: {date7: "value7"},
                        truck: {date9: "value9"}
                    }
                ],
                tableTitle: "tableTitle",
                setColTitle (date) {
                    return date;
                },
                setRowTitle (key, dataset) {
                    const date = Object.keys(dataset)[0];

                    return String(key) + String(date);
                }
            }
        });
    });

    describe("getValueString", () => {
        it("should always return the input as String, but an empty string if null was given", () => {
            expect(wrapper.vm.getValueString(null)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.getValueString(undefined)).to.equal("undefined");
            expect(wrapper.vm.getValueString("string")).to.equal("string");
            expect(wrapper.vm.getValueString(0)).to.equal("0");
            expect(wrapper.vm.getValueString(1)).to.equal("1");
            expect(wrapper.vm.getValueString(false)).to.equal("false");
            expect(wrapper.vm.getValueString(true)).to.equal("true");
        });
    });
    describe("getFirstDataset", () => {
        it("should return the dataset of the first dataObj in the given array", () => {
            const result = wrapper.vm.getFirstDataset(wrapper.vm.apiData),
                expected = {date3: "value3", date33: "value33"};

            expect(result).to.deep.equal(expected);
        });
    });
    describe("getFlatApiData", () => {
        it("should return a flat array of Object{key, dataset} of the given apiData", () => {
            const result = wrapper.vm.getFlatApiData(wrapper.vm.apiData),
                expected = [
                    {key: "truck", dataset: {date3: "value3", date33: "value33"}},
                    {key: "car", dataset: {date2: "value2", date22: null}},
                    {key: "bike", dataset: {date1: "value1"}},

                    {key: "car", dataset: {date5: "value5"}},
                    {key: "truck", dataset: {date6: "value6"}},
                    {key: "bike", dataset: {date4: "value4"}},

                    {key: "car", dataset: {date8: "value8"}},
                    {key: "bike", dataset: {date7: "value7"}},
                    {key: "truck", dataset: {date9: "value9"}}
                ];

            expect(result).to.deep.equal(expected);
        });
    });

    describe("template", () => {
        // siehe: https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/unittestingVue.md
        it("should render a table with thead and tbody", () => {
            const table = wrapper.find("table");

            expect(table.exists()).to.be.true;
            expect(table.find("thead").exists()).to.be.true;
            expect(table.find("tbody").exists()).to.be.true;
        });
        it("should set the prop title as text in the table headers first field", () => {
            const th = wrapper.findAll("th");

            expect(th.at(0).text()).to.equal("tableTitle");
        });
        it("should call setColTitle for the rest of th with the value found in the first dataset", () => {
            const th = wrapper.findAll("th");

            expect(th.at(1).text()).to.equal("date3");
            expect(th.at(2).text()).to.equal("date33");
        });
        it("should call setRowTitle for the first column of each row", () => {
            const tr = wrapper.findAll("tr");

            expect(tr.at(0).findAll("td").at(0).text()).to.equal("truckdate3");
            expect(tr.at(1).findAll("td").at(0).text()).to.equal("cardate2");
            expect(tr.at(2).findAll("td").at(0).text()).to.equal("bikedate1");

            expect(tr.at(3).findAll("td").at(0).text()).to.equal("cardate5");
            expect(tr.at(4).findAll("td").at(0).text()).to.equal("truckdate6");
            expect(tr.at(5).findAll("td").at(0).text()).to.equal("bikedate4");

            expect(tr.at(6).findAll("td").at(0).text()).to.equal("cardate8");
            expect(tr.at(7).findAll("td").at(0).text()).to.equal("bikedate7");
            expect(tr.at(8).findAll("td").at(0).text()).to.equal("truckdate9");
        });
        it("should place the value of each dataset into the fields of the table", () => {
            const tr = wrapper.findAll("tr");

            expect(tr.at(0).findAll("td").at(1).text()).to.equal("value3");
            expect(tr.at(0).findAll("td").at(2).text()).to.equal("value33");
            expect(tr.at(1).findAll("td").at(1).text()).to.equal("value2");
            expect(tr.at(1).findAll("td").at(2).text()).to.equal("");
            expect(tr.at(2).findAll("td").at(1).text()).to.equal("value1");

            expect(tr.at(3).findAll("td").at(1).text()).to.equal("value5");
            expect(tr.at(4).findAll("td").at(1).text()).to.equal("value6");
            expect(tr.at(5).findAll("td").at(1).text()).to.equal("value4");

            expect(tr.at(6).findAll("td").at(1).text()).to.equal("value8");
            expect(tr.at(7).findAll("td").at(1).text()).to.equal("value7");
            expect(tr.at(8).findAll("td").at(1).text()).to.equal("value9");
        });
    });
});
