import Vuex from "vuex";
import {shallowMount, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import GraphicalSelectComponent from "../../../components/GraphicalSelect.vue";
import GraphicalSelectModule from "../../../store/indexGraphicalSelect.js";
import Dropdown from "../../../../dropdowns/DropdownSimple.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

let store;

describe("src/share-components/graphicalSelect/components/GraphicalSelect.vue", () => {

    const GrandParentVm = mount({
            template: "<div/>"
        }).vm,

        Parent = {
            created () {
                this.$parent = GrandParentVm;
            }
        };

    beforeEach(function () {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                GraphicalSelect: GraphicalSelectModule

            }
        });
    });

    describe("Component DOM", () => {
        it("Dom should exist", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent});

            expect(wrapper.exists()).to.be.true;
        });

        it("should have a form element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent}),
                formElement = wrapper.find("form");

            expect(formElement.exists()).to.be.true;
        });

        it("the form element has a select element of class form-control", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent, stubs: {"Dropdown": Dropdown}}),
                formElement = wrapper.find("select.form-control");

            expect(formElement.exists()).to.be.true;
        });

        it("the select element of class form-control has at least one option element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent, stubs: {"Dropdown": Dropdown}});

            expect(wrapper.findAll("select.form-control > option")).to.not.have.lengthOf(0);
        });

        it("options contain only provided draw modus", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent, stubs: {"Dropdown": Dropdown}});
            let option = {};

            for (option in wrapper.vm.options) {
                expect(wrapper.vm.geographicValues).to.include(option);
            }
        });
    });
});
