<script>

export default {
    name: "ContinuousCountingBikeChart",
    components: {
    },
    props: {
        properties: {
            type: Object,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },
    data: () => ({tableVisible: true, chartVisible: true}),
    watch: {
        properties () {
            this.createD3Document();
        }
    },
    methods: {
        /**
         * createD3Document creates an object for the graph model to create the graphic
         * via radio trigger, the graphConfig object is transferred to the graph module
         * @param  {String} activeTab contains the value of the active tab
         * @fires Tools.Graph#event:RadioTriggerGraphCreateGraph
         * @return {void}
         */
        createD3Document () {
            const dataset = this.properties,
                graphConfig = {
                    graphType: "Linegraph",
                    selector: "#graph-" + this.type,
                    width: 700,
                    height: 250,
                    margin: {top: 20, right: 20, bottom: 50, left: 70},
                    svgClass: "graph-svg",
                    selectorTooltip: ".graph-tooltip-div",
                    scaleTypeX: "ordinal",
                    scaleTypeY: "linear",
                    data: dataset.data,
                    xAttr: "timestamp",
                    xAxisTicks: dataset.xAxisTicks,
                    xAxisLabel: {
                        label: dataset.xLabel,
                        translate: 20
                    },
                    yAxisLabel: dataset.yLabel,
                    attrToShowArray: dataset.graphArray,
                    legendData: dataset.legendArray
                };

            Radio.trigger("Graph", "createGraph", graphConfig);
        }

    }
};
</script>

<template>
    <div v-if="properties">
        <div>
            <input
                id="chartCheck"
                v-model="chartVisible"
                type="checkbox"
                class="chartCheckbox form-check-input"
            >
            <label
                class="form-check-label"
                for="chartCheck"
            >{{ $t("modules.tools.gfi.themes.continuousCountingBike.diagram") }}</label>
        </div>
        <div
            id="chart"
            :class="{hidden: !chartVisible}"
        >
            <div
                :id="`graph-${type}`"
                class="graph"
            >
                <div class="graph-tooltip-div"></div>
            </div>
        </div>
        <div>
            <input
                id="tableCheck"
                v-model="tableVisible"
                type="checkbox"
                class="tableCheckbox form-check-input"
            >
            <label
                class="form-check-label"
                for="tableCheck"
            >{{ $t("modules.tools.gfi.themes.continuousCountingBike.chart") }}</label>
        </div>
        <div
            v-if="tableVisible && properties.data"
            id="table-data-container"
        >
            <table class="table table-hover">
                <thead>
                    <th class="text-align-center">
                        {{ $t("modules.tools.gfi.themes.continuousCountingBike.name") }}
                    </th>
                    <th
                        v-for="(day, index) in properties.data"
                        :key="`header-${index}`"
                        class="text-align-center"
                    >
                        {{ day.timestamp }}
                    </th>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            {{ properties.Name }}
                        </td>
                        <td
                            v-for="(day, index) in properties.data"
                            :key="`data-${index}`"
                            class="data text-align-center"
                        >
                            {{ day.tableData }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style lang="less" scoped>
.hidden{
    display: none;
}
  #table-data-container {
        margin:6px 15px 0 12px;
        table {
            margin: 0;
            td, th {
                padding: 6px;
            }
        }
    }
    .data {
        white-space: nowrap;
    }
 .tab-content {
        padding: 5px 5px 5px 5px;
    }
    .graph {
        width: 780px;
        min-height: 285px;
        padding-bottom: 5px;
    }
     .line {
        fill: none;
        stroke: steelblue;
        stroke-width: 2px;
    }
    .dot {
        cursor: pointer;
        stroke: none;
        fill: steelblue;
    }
    .dot_visible {
        cursor: pointer;
        stroke: none;
        fill: red;
    }
    .dot_invisible {
        display: none;
    }
    .domain {
        fill: none;
        stroke: #000;
    }
    .graph-tooltip-div {
        transform: translateX(-50%);
        -moz-transform: translateX(-50%);
        -ms-transform: translateX(-50%);
        display: inline-block;
        position: absolute;
        color: black;
        padding: 2px;
        border: 2px solid white;
        text-align: center;
    }
</style>
