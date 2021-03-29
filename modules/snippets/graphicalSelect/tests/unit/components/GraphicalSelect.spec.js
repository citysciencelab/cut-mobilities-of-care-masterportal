/* import Vuex from "vuex";
import {shallowMount, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Feature from "ol/Feature";
import sinon from "sinon";
import GraphicalSelectComponent from "../../../components/GraphicalSelect.vue";
import GraphicalSelectModule from "../../../store/indexGraphicalSelect.js";
import GraphicalSelectState from "../../../store/stateGraphicalSelect.js";

const localVue = createLocalVue();
localVue.use(Vuex);

let store;
let geographicValues;
describe("modules/snippets/graphicalSelect/components/GraphicalSelect.vue", () => {
    let testFeatures,
        dropdownConfig;

        const GrandParentVm = mount({
            template: '<div />',
            data() {
              return { val: 1 }
            }
          }).vm

          const Parent = {
            created() {
              this.$parent = GrandParentVm
            }
          }

    const requiredProps = {selectElement: "", selectedOption: "", options:{}},
        factory = {
            getShallowMount: (props = requiredProps, Parent) => {
                return mount(GraphicalSelectComponent, {
                    propsData: {
                        ...props
                    },
                    parentComponent: Parent
                });
            }
        };

    beforeEach(function () {
        testFeatures = [
            new Feature({
                isVisible: false,
                fromDrawTool: false,
                drawState: {
                    drawType: {
                        id: "drawSymbol"
                    }
                }
            }),
            new Feature({
                isVisible: false,
                fromDrawTool: false,
                drawState: {
                    drawType: {
                        id: "drawArea"
                    }
                }
            }),
            new Feature({
                isVisible: false,
                fromDrawTool: false,
                drawState: {
                    drawType: {
                        id: "drawCircle"
                    }
                }
            })
        ];
        dropdownConfig = [{
            options: ["Box", "Circle", "Polygon"]
        }];

        store = new Vuex.Store({
            namespaces: true,
             modules: {
                GraphicalSelect: GraphicalSelectModule

            }
        });
        //store.commit("GraphicalSelect/setActive", true);
    });

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(GraphicalSelectComponent,{store, localVue,
                parentComponent: Parent
              })
            //const wrapper = factory.getShallowMount();

            expect(wrapper.exists()).to.be.true;
        });

        it("should have a form element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent,{store, localVue,
                parentComponent: Parent
              }),
                formElement = wrapper.find("form");

            expect(formElement.exists()).to.be.true;
        }); */
/*
        it("should have a form element with the id 'draw-filter", () => {
            const wrapper = factory.getShallowMount(),
                formElement = wrapper.find("form");

            expect(formElement.attributes("id")).to.equal("draw-filter");
        });

        it("should have a form element with no checkboxes", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.findAll(".checkbox")).to.have.lengthOf(0);
        });

        it("should have a form element with two checkboxes", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            expect(wrapper.findAll(".checkbox")).to.have.lengthOf(2);
        });

        it("should have the right labels for the checkboxes", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            wrapper.findAll("label").wrappers.forEach((label, index) => {
                expect(label.text()).to.equal(filterListConfig[index].name);
            });
        });

        it("should have no checked checkboxes", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            wrapper.findAll("input").wrappers.forEach(input => {
                expect(input.element.checked).to.be.false;
            });
        });

        it("should have no checked checkboxes is the features are visible, but they are not from draw tool", () => {
            testFeatures.forEach(feature => {
                feature.set("isVisible", true);
                feature.set("fromDrawTool", false);
            });
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            wrapper.findAll("input").wrappers.forEach(input => {
                expect(input.element.checked).to.be.false;
            });
        });

        it("should have only checked checkboxes", () => {
            testFeatures.forEach(feature => {
                feature.set("isVisible", true);
                feature.set("fromDrawTool", true);
            });
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            wrapper.findAll("input").wrappers.forEach(input => {
                expect(input.element.checked).to.be.true;
            });
        });

        it("should have one checked and one unchecked checkbox", () => {
            testFeatures[0].set("isVisible", true);
            testFeatures[0].set("fromDrawTool", true);
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props),
                inputElements = wrapper.findAll("input").wrappers;

            expect(inputElements[0].element.checked).to.be.true;
            expect(inputElements[1].element.checked).to.be.false;
        });*/
//  });

/* describe("User Interactions", () => {
        it("should call setFeaturesVisibility if checkbox change event is triggered", async () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props),
                inputElement = wrapper.find("input"),
                spySetFeaturesVisibility = sinon.spy(wrapper.vm, "setFeaturesVisibility");

            await inputElement.setChecked();
            expect(spySetFeaturesVisibility.calledOnce).to.be.true;
            spySetFeaturesVisibility.restore();
        });
    });

    describe("Properties", () => {
        it("should return groupedFeatures as an object ", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            expect(wrapper.vm.groupedFeatures).is.an("object");
        });

        it("groupedFeatures should have the keys 'Taktische Zeichen und Beschriftung' and 'Polygone und Radien'", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            expect(wrapper.vm.groupedFeatures).to.have.all.keys("Taktische Zeichen und Beschriftung", "Polygone und Radien");
        });

        it("groupedFeatures['Taktische Zeichen und Beschriftung'] should have an array with one feature", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            expect(wrapper.vm.groupedFeatures["Taktische Zeichen und Beschriftung"]).to.have.lengthOf(1);
        });

        it("groupedFeatures['Polygone und Radien'] should have an array with two features in the attribute", () => {
            const props = {filterList: filterListConfig, features: testFeatures},
                wrapper = factory.getShallowMount(props);

            expect(wrapper.vm.groupedFeatures["Polygone und Radien"]).to.have.lengthOf(2);
        });
    });*/
// });
