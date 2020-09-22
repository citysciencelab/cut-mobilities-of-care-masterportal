import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import TrafficCountCompDiagram from "../../components/TrafficCountCompDiagram.vue";
import ChartJs from "chart.js";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/trafficCount/components/TrafficCountCompDiagram.vue", () => {
    const apiDataDefault = [
        {
            meansOfTransport: {
                "2020-09-22 00:00:00": 1,
                "2020-09-22 00:15:00": 2,
                "2020-09-22 00:30:00": 3
            }
        }
    ];
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(TrafficCountCompDiagram, {
            localVue,
            propsData: {
                apiData: apiDataDefault,
                setTooltipValue: (tooltipItem) => {
                    return tooltipItem.label + ": " + tooltipItem.value;
                },
                xAxisTicks: 12,
                yAxisTicks: 8,
                renderLabelXAxis: (datetime) => {
                    return datetime;
                },
                renderLabelYAxis: (yValue) => {
                    return yValue;
                },
                descriptionXAxis: "description of x axis",
                descriptionYAxis: "description of y axis",
                renderLabelLegend: (datetime) => {
                    return datetime;
                }
            }
        });
    });

    describe("createDataForDiagram", () => {
        it("should return an empty array if apiData is empty or no array", () => {
            expect(wrapper.vm.createDataForDiagram(undefined)).to.be.an("array").and.to.be.empty;
            expect(wrapper.vm.createDataForDiagram(null)).to.be.an("array").and.to.be.empty;
            expect(wrapper.vm.createDataForDiagram(1234)).to.be.an("array").and.to.be.empty;
            expect(wrapper.vm.createDataForDiagram("string")).to.be.an("array").and.to.be.empty;
            expect(wrapper.vm.createDataForDiagram({})).to.be.an("array").and.to.be.empty;
            expect(wrapper.vm.createDataForDiagram([])).to.be.an("array").and.to.be.empty;
        });
        it("should set the keys of the first occuring dataset as labels", () => {
            const apiData = [
                    {
                        meansOfTransport: {
                            "key1": "value1",
                            "key2": "value2",
                            "keyN": "valueN"
                        }
                    }
                ],
                result = wrapper.vm.createDataForDiagram(apiData),
                expectedLabels = ["key1", "key2", "keyN"];

            expect(result).to.be.an("object");
            expect(result.labels).to.deep.equal(expectedLabels);
        });
        it("should create data to be used by chartjs", () => {
            const apiData = [
                    {
                        meansOfTransport: {
                            "Akey1": "Avalue1",
                            "Akey2": "Avalue2",
                            "AkeyN": "AvalueN"
                        }
                    },
                    {
                        meansOfTransport: {
                            "Bkey1": "Bvalue1",
                            "Bkey2": "Bvalue2",
                            "BkeyN": "BvalueN"
                        }
                    }
                ],
                colors = ["Acolor", "Bcolor"],
                testFunctions = {
                    callbackRenderLabelLegend: datetime => {
                        return datetime;
                    }
                },
                result = wrapper.vm.createDataForDiagram(apiData, colors, testFunctions.callbackRenderLabelLegend);

            expect(result).to.be.an("object");
            expect(result.datasets).to.be.an("array").to.have.length(2);

            expect(result.datasets[0]).to.be.an("object");
            expect(result.datasets[0].label).to.equal("Akey1");
            expect(result.datasets[0].data).to.deep.equal(["Avalue1", "Avalue2", "AvalueN"]);
            expect(result.datasets[0].backgroundColor).to.equal("Acolor");
            expect(result.datasets[0].borderColor).to.equal("Acolor");
            expect(result.datasets[0].spanGaps).to.be.false;
            expect(result.datasets[0].fill).to.be.false;
            expect(result.datasets[0].borderWidth).to.equal(1);
            expect(result.datasets[0].pointRadius).to.equal(2);
            expect(result.datasets[0].pointHoverRadius).to.equal(2);

            expect(result.datasets[1]).to.be.an("object");
            expect(result.datasets[1].label).to.equal("Bkey1");
            expect(result.datasets[1].data).to.deep.equal(["Bvalue1", "Bvalue2", "BvalueN"]);
            expect(result.datasets[1].backgroundColor).to.equal("Bcolor");
            expect(result.datasets[1].borderColor).to.equal("Bcolor");
            expect(result.datasets[1].spanGaps).to.be.false;
            expect(result.datasets[1].fill).to.be.false;
            expect(result.datasets[1].borderWidth).to.equal(1);
            expect(result.datasets[1].pointRadius).to.equal(2);
            expect(result.datasets[1].pointHoverRadius).to.equal(2);
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
                    colorTooltipFont: "colorTooltipFont",
                    colorTooltipBack: "colorTooltipBack",
                    setTooltipValue: v => "setTooltipValue" + v,
                    fontSizeGraph: "fontSizeGraph",
                    fontSizeLegend: "fontSizeLegend",
                    fontColorGraph: "fontColorGraph",
                    fontColorLegend: "fontColorLegend",
                    gridLinesColor: "gridLinesColor",
                    xAxisTicks: "xAxisTicks",
                    yAxisTicks: "yAxisTicks",
                    renderLabelXAxis: v => "renderLabelXAxis" + v,
                    renderLabelYAxis: v => "renderLabelYAxis" + v,
                    descriptionXAxis: "descriptionXAxis",
                    descriptionYAxis: "descriptionYAxis"
                },
                result = wrapper.vm.getChartJsConfig(data, options);

            expect(result).to.be.an("object");
            expect(result.options).to.be.an("object");

            expect(result.options.legend).to.be.an("object");
            expect(result.options.legend.labels).to.be.an("object");
            expect(result.options.legend.labels.fontSize).to.equal("fontSizeLegend");
            expect(result.options.legend.labels.fontColorLegend).to.equal("fontColorLegend");

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
            expect(result.options.scales.xAxes[0].ticks.maxTicksLimit).to.equal("xAxisTicks");
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
            expect(result.options.scales.yAxes[0].ticks.maxTicksLimit).to.equal("yAxisTicks");
            expect(result.options.scales.yAxes[0].ticks.callback).to.be.a("function");
            expect(result.options.scales.yAxes[0].ticks.callback("Test")).to.equal("renderLabelYAxisTest");
            expect(result.options.scales.yAxes[0].gridLines).to.be.an("object");
            expect(result.options.scales.yAxes[0].gridLines.color).to.equal("gridLinesColor");
            expect(result.options.scales.yAxes[0].scaleLabel).to.be.an("object");
            expect(result.options.scales.yAxes[0].scaleLabel.display).to.be.true;
            expect(result.options.scales.yAxes[0].scaleLabel.labelString).to.equal("descriptionYAxis");
        });

        describe("mounted", () => {
            it("should create a new instance of ChartJs on startup", () => {
                expect(wrapper.vm.chart).to.be.an.instanceof(ChartJs);
            });
        });
    });
});
