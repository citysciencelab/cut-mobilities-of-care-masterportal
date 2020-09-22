<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import {addMissingDataDay} from "../library/addMissingData.js";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import moment from "moment";

export default {
    name: "TrafficCountDay",
    components: {
        TrafficCountCompDiagram,
        TrafficCountCompTable
    },
    data () {
        return {
            // TODO: update apiData, mit der update-Funktion der Api
            apiData: [
                {
                    fahrrad: addMissingDataDay("2020-09-22 00:00:00", {
                        "2020-09-22 00:00:00": 3000,
                        "2020-09-22 00:15:00": 4583,
                        "2020-09-22 00:30:00": 300
                    })
                },
                {
                    fahrrad: addMissingDataDay("2020-09-21 00:00:00", {
                        "2020-09-21 00:00:00": 1234,
                        "2020-09-21 00:15:00": 432,
                        "2020-09-21 00:30:00": 3111
                    })
                }
            ],

            // props for diagram
            setTooltipValue: (tooltipItem) => {
                return moment(tooltipItem.label, "YYYY-MM-DD HH:mm:ss").format("HH:mm") + " Uhr: " + thousandsSeparator(tooltipItem.value);
            },
            xAxisTicks: 12,
            yAxisTicks: 8,
            renderLabelXAxis: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("HH:mm") + " Uhr";
            },
            renderLabelYAxis: (yValue) => {
                return thousandsSeparator(yValue);
            },
            descriptionYAxis: "Anzahl / 15 Min.",
            renderLabelLegend: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY");
            },

            // props for table
            tableTitle: "Datum",
            setColTitle: datetime => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("HH:mm") + " Uhr";
            },
            setRowTitle: (meansOfTransports, datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY");
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            }
        };
    },
    mounted () {
        // TODO: dies muss entfernt werden - ist nur zum Testen.
        Backbone.updateDiagramDay = () => {
            this.apiData = [
                {
                    fahrrad: addMissingDataDay("2020-09-22 00:00:00", {
                        "2020-09-22 00:00:00": 3000,
                        "2020-09-22 00:15:00": 4583,
                        "2020-09-22 00:30:00": 4000
                    })
                },
                {
                    fahrrad: addMissingDataDay("2020-09-21 00:00:00", {
                        "2020-09-21 00:00:00": 1234,
                        "2020-09-21 00:15:00": 432,
                        "2020-09-21 00:30:00": 5000
                    })
                }
            ];
        };
    }
};
</script>

<template>
    <div>
        <TrafficCountCompDiagram
            :apiData="apiData"
            :setTooltipValue="setTooltipValue"
            :xAxisTicks="xAxisTicks"
            :yAxisTicks="yAxisTicks"
            :renderLabelXAxis="renderLabelXAxis"
            :renderLabelYAxis="renderLabelYAxis"
            :descriptionYAxis="descriptionYAxis"
            :renderLabelLegend="renderLabelLegend"
        />
        <TrafficCountCompTable
            :apiData="apiData"
            :tableTitle="tableTitle"
            :setColTitle="setColTitle"
            :setRowTitle="setRowTitle"
            :setFieldValue="setFieldValue"
        />
    </div>
</template>

<style scoped>

</style>
