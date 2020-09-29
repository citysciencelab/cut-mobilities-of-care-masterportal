import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import BildungsatlasCompBarchart from "../../components/BildungsatlasCompBarchart.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/BildungsatlasCompBarchart.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(BildungsatlasCompBarchart, {
            propsData: {
                data: {
                    labels: [],
                    datasets: []
                },
                setTooltipValue: (tooltipItem) => {
                    return tooltipItem.value;
                },
                renderLabelXAxis: (xValue) => {
                    return xValue;
                },
                renderLabelYAxis: (yValue) => {
                    return yValue;
                }
            },
            localVue
        });
    });

    describe("getChartJsConfig", () => {
        it("should put the given data into the config, using default values as options (as non are given)", () => {
            const data = "data",
                result = wrapper.vm.getChartJsConfig(data);

            expect(result).to.be.an("object");
            expect(result.data).to.equal("data");
        });
        it("should use the given options and place them at the right place in the chartsjs config", () => {
            const data = "data",
                options = {
                    chartTitle: "chartTitle",
                    colorTooltipFont: "colorTooltipFont",
                    colorTooltipBack: "colorTooltipBack",
                    setTooltipValue: v => "setTooltipValue" + v,
                    fontSizeGraph: "fontSizeGraph",
                    fontColorGraph: "fontColorGraph",
                    gridLinesColor: "gridLinesColor",
                    gridLinesColorZero: "gridLinesColorZero",
                    renderLabelXAxis: v => "renderLabelXAxis" + v,
                    renderLabelYAxis: v => "renderLabelYAxis" + v,
                    descriptionXAxis: "descriptionXAxis",
                    descriptionYAxis: "descriptionYAxis"
                },
                result = wrapper.vm.getChartJsConfig(data, options);

            expect(result).to.be.an("object");
            expect(result.options).to.be.an("object");

            expect(result.options.title).to.be.an("object");
            expect(result.options.title.text).to.be.a("string");
            expect(result.options.title.text).to.equal("chartTitle");

            expect(result.options.tooltips).to.be.an("object");
            expect(result.options.tooltips.bodyFontColor).to.equal("colorTooltipFont");
            expect(result.options.tooltips.backgroundColor).to.equal("colorTooltipBack");
            expect(result.options.tooltips.callbacks).to.be.an("object");
            expect(result.options.tooltips.callbacks.label).to.be.a("function");
            expect(result.options.tooltips.callbacks.label("Test")).to.equal("setTooltipValueTest");

            expect(result.options.scales).to.be.an("object");
            expect(result.options.scales.xAxes).to.be.an("array").and.to.have.length(1);
            expect(result.options.scales.xAxes[0]).to.be.an("object");
            expect(result.options.scales.xAxes[0].ticks).to.be.an("object");
            expect(result.options.scales.xAxes[0].ticks.fontSize).to.equal("fontSizeGraph");
            expect(result.options.scales.xAxes[0].ticks.fontColor).to.equal("fontColorGraph");
            expect(result.options.scales.xAxes[0].ticks.callback).to.be.a("function");
            expect(result.options.scales.xAxes[0].ticks.callback("Test")).to.equal("renderLabelXAxisTest");
            expect(result.options.scales.xAxes[0].gridLines).to.be.an("object");
            expect(result.options.scales.xAxes[0].gridLines.color).to.equal("gridLinesColor");
            expect(result.options.scales.xAxes[0].scaleLabel).to.be.an("object");
            expect(result.options.scales.xAxes[0].scaleLabel.display).to.be.true;
            expect(result.options.scales.xAxes[0].scaleLabel.labelString).to.equal("descriptionXAxis");

            expect(result.options.scales).to.be.an("object");
            expect(result.options.scales.yAxes).to.be.an("array").and.to.have.length(1);
            expect(result.options.scales.yAxes[0]).to.be.an("object");
            expect(result.options.scales.yAxes[0].ticks).to.be.an("object");
            expect(result.options.scales.yAxes[0].ticks.fontSize).to.equal("fontSizeGraph");
            expect(result.options.scales.yAxes[0].ticks.fontColor).to.equal("fontColorGraph");
            expect(result.options.scales.yAxes[0].ticks.callback).to.be.a("function");
            expect(result.options.scales.yAxes[0].ticks.callback("Test")).to.equal("renderLabelYAxisTest");
            expect(result.options.scales.yAxes[0].gridLines).to.be.an("object");
            expect(result.options.scales.yAxes[0].gridLines.color).to.equal("gridLinesColor");
            expect(result.options.scales.yAxes[0].scaleLabel).to.be.an("object");
            expect(result.options.scales.yAxes[0].scaleLabel.display).to.be.true;
            expect(result.options.scales.yAxes[0].scaleLabel.labelString).to.equal("descriptionYAxis");
        });
    });
});
