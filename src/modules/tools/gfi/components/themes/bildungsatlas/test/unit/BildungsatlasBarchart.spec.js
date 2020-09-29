import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import BildungsatlasBarchart from "../../components/BildungsatlasBarchart.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/BildungsatlasBarchart.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(BildungsatlasBarchart, {
            propsData: {
                feature: {
                    getProperties () {
                        return {};
                    },
                    getGfiFormat () {
                        return {
                            gfiSubTheme: "gfiSubTheme"
                        };
                    }
                },
                fixDataBug: value => value,
                getValueForBildungsatlas: value => value,
                isActiveTab: value => value
            },
            localVue
        });
    });

    describe("getSubThemeTitle", () => {
        it("should return an empty string if anything but the expected object and keys are given", () => {
            expect(wrapper.vm.getSubThemeTitle(undefined)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.getSubThemeTitle(null)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.getSubThemeTitle(1234)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.getSubThemeTitle("string")).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.getSubThemeTitle([])).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.getSubThemeTitle({})).to.be.a("string").and.to.be.empty;
        });
        it("should return the content of key stadtteil", () => {
            expect(wrapper.vm.getSubThemeTitle({stadtteil: "stadtteil"})).to.equal("stadtteil");
        });
        it("should return the content of key sozialraum_name", () => {
            expect(wrapper.vm.getSubThemeTitle({sozialraum_name: "sozialraum_name"})).to.equal("sozialraum_name");
        });
        it("should return the content of stadtteil before sozialraum_name", () => {
            const properties = {
                stadtteil: "stadtteil",
                sozialraum_name: "sozialraum_name"
            };

            expect(wrapper.vm.getSubThemeTitle(properties)).to.equal("stadtteil");
        });
    });
    describe("getLastKeyOfYeardata", () => {
        it("should return the key with the highest value of the given date with prefixed key", () => {
            const properties = {
                "should not be returned": true,
                "prefix_0": true,
                "should not be returned either": true,
                "prefix_2": true,
                "prefix_1": true
            };

            expect(wrapper.vm.getLastKeyOfYeardata(properties, "prefix_")).to.equal("prefix_2");
        });
        it("should return false if no matching key was found for the given prefix", () => {
            const properties = {
                "should not be returned": true,
                "noprefix_0": true,
                "should not be returned either": true,
                "noprefix_2": true,
                "noprefix_1": true
            };

            expect(wrapper.vm.getLastKeyOfYeardata(properties, "prefix_")).to.be.false;
        });
    });
    describe("createDataForDiagram", () => {
        it("should create an object to be used for chartjs data from properties with manipulated keys", () => {
            const properties = {
                    "should not be returned": true,
                    "prefix_0": 2,
                    "should not be returned either": true,
                    "prefix_2": 1,
                    "prefix_1": 0
                },
                testFunctions = {
                    fixDataBug: value => {
                        return value + "Fixed";
                    }
                },
                expected = {
                    labels: ["0", "2", "1"],
                    datasets: [{
                        backgroundColor: wrapper.vm.barBackgroundColor,
                        hoverBackgroundColor: wrapper.vm.barHoverBackgroundColor,
                        borderWidth: 0,
                        data: ["2Fixed", "1Fixed", "0Fixed"]
                    }]
                },
                result = wrapper.vm.createDataForDiagram(properties, "prefix_", testFunctions.fixDataBug);

            expect(result).to.deep.equal(expected);
        });
    });
});
