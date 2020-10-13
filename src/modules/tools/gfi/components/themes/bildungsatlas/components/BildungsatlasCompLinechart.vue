<script>
import ChartJs from "chart.js";

export default {
    name: "BildungsatlasCompLinechart",
    props: {
        /**
         * the charts title, shown above the chart
         * set empty string to remove the title
         */
        chartTitle: {
            type: String,
            required: false,
            default: ""
        },
        /**
         * the data for the chart as required by chartjs
         */
        data: {
            type: Object,
            required: true
        },

        /**
         * sets the tooltip if the mouse hovers over a point
         * @param {Object} tooltipItem the tooltipItem from chartjs (see https://www.chartjs.org/docs/latest/configuration/tooltip.html?h=tooltipitem)
         * @returns {String}  the String to show
         */
        setTooltipValue: {
            type: Function,
            required: true
        },
        /**
         * sets the label of the x axis
         * @param {String} datetime the value of the x axis - the datetime in our case
         * @returns {String}  the label of the x axis
         */
        renderLabelXAxis: {
            type: Function,
            required: true
        },
        /**
         * sets the label of the y axis
         * @param {String} yValue the value of the y axis
         * @returns {String}  the label of the y axis
         */
        renderLabelYAxis: {
            type: Function,
            required: true
        },
        /**
         * sets the description for the x axis
         */
        descriptionXAxis: {
            type: String,
            required: false,
            default: ""
        },
        /**
         * sets the description for the y axis
         */
        descriptionYAxis: {
            type: String,
            required: false,
            default: ""
        }
    },
    data () {
        return {
            fontColorGraph: "black",
            fontColorLegend: "#555555",
            fontSizeGraph: 10,
            fontSizeLegend: 12,
            gridLinesColor: "#dddddd",
            gridLinesColorZero: "black",
            colorTooltipFont: "#555555",
            colorTooltipBack: "#f0f0f0",

            chart: null
        };
    },
    watch: {
        data () {
            this.resetChart();
        }
    },
    mounted () {
        this.$nextTick(() => {
            /**
             * @see afterFit https://www.chartjs.org/docs/latest/axes/?h=afterfit
             * @returns {Void}  -
             */
            ChartJs.Legend.prototype.afterFit = function () {
                this.height += 10;
            };

            this.resetChart();
        });
    },
    methods: {
        /**
         * destroys the old charts and creates a new chart
         * @pre the old chart is shown or no chart is initialized
         * @post the chart based on current data and props is shown
         * @returns {Void}  -
         */
        resetChart () {
            const ctx = this.$el.getContext("2d");

            if (this.chart instanceof ChartJs) {
                this.chart.destroy();
            }

            this.chart = new ChartJs(ctx, this.getChartJsConfig(this.data, {
                chartTitle: this.chartTitle,
                setTooltipValue: this.setTooltipValue,
                renderLabelXAxis: this.renderLabelXAxis,
                renderLabelYAxis: this.renderLabelYAxis,
                descriptionXAxis: this.descriptionXAxis,
                descriptionYAxis: this.descriptionYAxis,

                colorTooltipFont: this.colorTooltipFont,
                colorTooltipBack: this.colorTooltipBack,
                fontSizeGraph: this.fontSizeGraph,
                fontColorGraph: this.fontColorGraph,
                gridLinesColor: this.gridLinesColor,
                gridLinesColorZero: this.gridLinesColorZero
            }));
        },
        /**
         * returns the config for chart js
         * @param {Object} data the data to use
         * @param {Object} givenOptions an object with the callbacks and values used to create the config
         * @returns {Object}  an object to use as config for chartjs
         */
        getChartJsConfig (data, givenOptions) {
            const options = Object.assign({
                chartTitle: "",
                colorTooltipFont: "#555555",
                colorTooltipBack: "#f0f0f0",
                setTooltipValue: tooltipItem => {
                    return tooltipItem.value;
                },
                fontSizeGraph: 10,
                fontSizeLegend: 12,
                fontColorGraph: "black",
                fontColorLegend: "#555555",
                gridLinesColor: "#dddddd",
                gridLinesColorZero: "black",
                renderLabelXAxis: datetime => datetime,
                renderLabelYAxis: yValue => yValue,
                descriptionXAxis: "",
                descriptionYAxis: ""
            }, givenOptions);

            return {
                type: "line",
                data,
                options: {
                    responsive: true,
                    aspectRatio: 1,
                    title: {
                        display: options.chartTitle !== "",
                        text: options.chartTitle
                    },
                    legend: {
                        display: true,
                        onClick: (e) => e.stopPropagation(),
                        labels: {
                            usePointStyle: true,
                            fontSize: options.fontSizeLegend,
                            fontColorLegend: options.fontColorLegend,
                            padding: 10,
                            boxWidth: 8
                        },
                        align: "start"
                    },
                    tooltips: {
                        bodyFontColor: options.colorTooltipFont,
                        backgroundColor: options.colorTooltipBack,
                        yAlign: "bottom",
                        custom: (tooltip) => {
                            if (!tooltip) {
                                return;
                            }
                            // disable displaying the color box;
                            tooltip.displayColors = false;
                        },
                        callbacks: {
                            // use label callback to return the desired label
                            label: (tooltipItem) => {
                                return options.setTooltipValue(tooltipItem);
                            },
                            // remove title
                            title: () => {
                                return false;
                            }
                        }
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true,
                        onHover: function (e) {
                            const point = this.getElementAtEvent(e);

                            if (point.length) {
                                e.target.style.cursor = "pointer";
                            }
                            else {
                                e.target.style.cursor = "default";
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            ticks: {
                                fontSize: options.fontSizeGraph,
                                fontColor: options.fontColorGraph,
                                autoSkip: true,
                                callback: (xValue) => {
                                    return options.renderLabelXAxis(xValue);
                                }
                            },
                            gridLines: {
                                display: true,
                                lineWidth: 1,
                                drawBorder: false,
                                drawOnChartArea: true,
                                zeroLineColor: options.gridLinesColorZero,
                                color: options.gridLinesColor
                            },
                            scaleLabel: {
                                display: Boolean(options.descriptionXAxis),
                                labelString: options.descriptionXAxis
                            }
                        }],
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                fontSize: options.fontSizeGraph,
                                fontColor: options.fontColorGraph,
                                callback: (yValue) => {
                                    return options.renderLabelYAxis(yValue);
                                }
                            },
                            gridLines: {
                                display: true,
                                lineWidth: 1,
                                drawBorder: false,
                                drawOnChartArea: true,
                                zeroLineColor: options.gridLinesColorZero,
                                color: options.gridLinesColor
                            },
                            scaleLabel: {
                                display: Boolean(options.descriptionYAxis),
                                labelString: options.descriptionYAxis
                            }
                        }]
                    }
                }
            };
        }
    }
};
</script>

<template>
    <canvas />
</template>
