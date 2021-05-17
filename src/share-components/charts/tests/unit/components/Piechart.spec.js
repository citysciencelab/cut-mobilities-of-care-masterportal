import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Piechart from "../../../components/Piechart.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("share-components/charts/components/Piechart.vue", () => {

    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(Piechart, {
            propsData: {
                data: {
                    labels: [],
                    datasets: [],
                    defaultOptions: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "top"
                            }
                        }
                    }
                },
                givenOptions: {
                    responsive: false,
                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            },
            localVue
        });
    });

    describe("getChartJsOptions", () => {
        it("should return chartjs options by replacing defaults with the given options", () => {

            const result = wrapper.vm.getChartJsOptions(wrapper.vm.givenOptions, wrapper.vm.defaultOptions);

            expect(result).to.be.an("object");
            expect(result).to.deep.equal(wrapper.vm.givenOptions);
            expect(result.responsive).to.be.false;
            expect(wrapper.find("canvas").exists()).to.be.true;
        });

        it("should return the default options, if the given options are empty", () => {

            const result = wrapper.vm.getChartJsOptions({}, wrapper.vm.defaultOptions);

            expect(result).to.be.an("object");
            expect(result).to.deep.equal(wrapper.vm.defaultOptions);
            expect(wrapper.find("canvas").exists()).to.be.true;
        });

        it("should return the given options, if the default options are empty", () => {

            const result = wrapper.vm.getChartJsOptions(wrapper.vm.givenOptions, {});

            expect(result).to.be.an("object");
            expect(result).to.deep.equal(wrapper.vm.givenOptions);
            expect(wrapper.find("canvas").exists()).to.be.true;
        });

        it("should return empty object, if given and default options are empty", () => {

            const result = wrapper.vm.getChartJsOptions({}, {});

            expect(result).to.be.an("object");
            expect(result).to.deep.equal({});
            expect(wrapper.find("canvas").exists()).to.be.true;
        });
    });
});
