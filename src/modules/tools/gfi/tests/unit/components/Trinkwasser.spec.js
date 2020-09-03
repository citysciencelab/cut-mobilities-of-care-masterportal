import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Trinkwasser from "../../../components/themes/Trinkwasser.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/Trinkwasser.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(Trinkwasser, {
            localVue,
            propsData: {
                feature: {
                    getTheme: () => "Trinkwasser",
                    getTitle: () => "Trinkwasser",
                    getMappedProperties () {
                        return {
                            "Entnahmedatum": "Value Entnahmedatum",
                            "Coliforme Bakterien": "Value Coliforme Bakterien",
                            "Escherichia coli": "Value Escherichia coli",
                            "Others1": "Value Others1",
                            "Others2": "Value Others2"
                        };
                    }
                }
            }
        });
    });

    describe("mapPropertiesToBlueprint", () => {
        it("should place the values of the given properties into the given blueprint", () => {
            const blueprint = {
                    "titleA": {
                        "data1": null,
                        "data2": null
                    },
                    "titleB": {
                        "data3": null,
                        "data4": null
                    },
                    "titleN": {}
                },
                addSecludedValuesInto = "titleN",
                properties = {
                    "data1": "value1",
                    "data2": "value2",
                    "data3": "value3",
                    "data4": "value4",
                    "data5": "value5",
                    "data6": "value6",
                    "dataN": "valueN"
                },
                expected = {
                    "titleA": {
                        "data1": "value1",
                        "data2": "value2"
                    },
                    "titleB": {
                        "data3": "value3",
                        "data4": "value4"
                    },
                    "titleN": {
                        "data5": "value5",
                        "data6": "value6",
                        "dataN": "valueN"
                    }
                },
                result = wrapper.vm.mapPropertiesToBlueprint(blueprint, properties, addSecludedValuesInto);

            expect(result).to.deep.equal(expected);
        });
        it("should place the values in order of the given properties but the titles in order of the blueprint", () => {
            const blueprint = {
                    "titleB": {
                        "data4": null,
                        "data3": null
                    },
                    "titleA": {
                        "data2": null,
                        "data1": null
                    },
                    "titleN": {}
                },
                addSecludedValuesInto = "titleN",
                properties = {
                    "data1": "value1",
                    "data2": "value2",
                    "data3": "value3",
                    "data4": "value4",
                    "data5": "value5",
                    "data6": "value6",
                    "dataN": "valueN"
                },
                expected = {
                    "titleB": {
                        "data3": "value3",
                        "data4": "value4"
                    },
                    "titleA": {
                        "data1": "value1",
                        "data2": "value2"
                    },
                    "titleN": {
                        "data5": "value5",
                        "data6": "value6",
                        "dataN": "valueN"
                    }
                },
                result = wrapper.vm.mapPropertiesToBlueprint(blueprint, properties, addSecludedValuesInto);

            expect(result).to.deep.equal(expected);
        });
    });

    describe("template", () => {
        it("should place the title into the thead of each inner table", () => {
            expect(wrapper.findAll(".innerTable").at(0).find("thead").find("th").element.textContent.trim()).to.equal("Untersuchungsergebnisse");
            expect(wrapper.findAll(".innerTable").at(1).find("thead").find("th").element.textContent.trim()).to.equal("Mikrobiologische Parameter");
            expect(wrapper.findAll(".innerTable").at(2).find("thead").find("th").element.textContent.trim()).to.equal("Chemische Parameter");
        });
        it("should place the keys and values into the tbody of each inner table", () => {
            expect(wrapper.findAll(".firstCol").at(0).element.textContent.trim()).to.equal("Entnahmedatum");
            expect(wrapper.findAll(".firstCol").at(1).element.textContent.trim()).to.equal("Coliforme Bakterien");
            expect(wrapper.findAll(".firstCol").at(2).element.textContent.trim()).to.equal("Escherichia coli");
            expect(wrapper.findAll(".firstCol").at(3).element.textContent.trim()).to.equal("Others1");
            expect(wrapper.findAll(".firstCol").at(4).element.textContent.trim()).to.equal("Others2");

            expect(wrapper.findAll(".secCol").at(0).element.textContent.trim()).to.equal("Value Entnahmedatum");
            expect(wrapper.findAll(".secCol").at(1).element.textContent.trim()).to.equal("Value Coliforme Bakterien");
            expect(wrapper.findAll(".secCol").at(2).element.textContent.trim()).to.equal("Value Escherichia coli");
            expect(wrapper.findAll(".secCol").at(3).element.textContent.trim()).to.equal("Value Others1");
            expect(wrapper.findAll(".secCol").at(4).element.textContent.trim()).to.equal("Value Others2");
        });
    });
});
