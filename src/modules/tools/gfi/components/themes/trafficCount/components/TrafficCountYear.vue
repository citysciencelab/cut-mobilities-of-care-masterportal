<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import {addMissingDataYear} from "../library/addMissingData.js";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import moment from "moment";

export default {
    name: "TrafficCountYear",
    components: {
        TrafficCountCompDiagram,
        TrafficCountCompTable,
        TrafficCountCheckbox
    },
    data () {
        return {
            // TODO: update apiData, mit der update-Funktion der Api
            apiData: [
                {
                    fahrrad: addMissingDataYear("2020", {
                        "2020-09-07 00:00:00": 4000,
                        "2020-09-14 00:00:00": 4583,
                        "2020-09-21 00:00:00": 300
                    })
                },
                {
                    fahrrad: addMissingDataYear("2019", {
                        "2019-09-09 00:00:00": 4321,
                        "2019-09-16 00:00:00": 2000,
                        "2019-09-23 00:00:00": 3000
                    })
                }
            ],

            // props for diagram
            setTooltipValue: (tooltipItem) => {
                // add 3 days to match thursdays
                const objMoment = moment(tooltipItem.label, "YYYY-MM-DD HH:mm:ss").add(3, "days");

                return "KW " + objMoment.format("WW") + " / " + objMoment.format("YYYY") + ": " + thousandsSeparator(tooltipItem.value);
            },
            yAxisTicks: 8,
            renderLabelXAxis: (datetime) => {
                // add 3 days to match thursdays
                const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days");

                return "KW" + objMoment.format("WW");
            },
            renderLabelYAxis: (yValue) => {
                return thousandsSeparator(yValue);
            },
            descriptionYAxis: "Anzahl / Tag",
            renderLabelLegend: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");
            },

            // props for table
            tableTitle: "Jahr",
            setColTitle: datetime => {
                return "KW" + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("WW");
            },
            setRowTitle: (meansOfTransports, datetime) => {
                // datetime is the monday of the week - so we have to add 3 days to get the thursday of the week
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            },
            diagramYear: "diagramYear",
            tableYear: "tableYear"
        };
    },
    mounted () {
        // TODO: dies muss entfernt werden - ist nur zum Testen.
        Backbone.updateDiagramYear = () => {
            this.apiData = [
                {
                    fahrrad: addMissingDataYear("2020", {
                        "2020-09-07 00:00:00": 4000,
                        "2020-09-14 00:00:00": 4583,
                        "2020-09-21 00:00:00": 2100
                    })
                },
                {
                    fahrrad: addMissingDataYear("2019", {
                        "2019-09-09 00:00:00": 4321,
                        "2019-09-16 00:00:00": 2000,
                        "2019-09-23 00:00:00": 5000
                    })
                }
            ];
        };
    }
};
</script>

<template>
    <div>
        <TrafficCountCheckbox
            :tableDiagramId="diagramYear"
        />
        <div id="diagramYear">
            <TrafficCountCompDiagram
                :apiData="apiData"
                :setTooltipValue="setTooltipValue"
                :yAxisTicks="yAxisTicks"
                :renderLabelXAxis="renderLabelXAxis"
                :renderLabelYAxis="renderLabelYAxis"
                :descriptionYAxis="descriptionYAxis"
                :renderLabelLegend="renderLabelLegend"
            />
        </div>
        <TrafficCountCheckbox
            :tableDiagramId="tableYear"
        />
        <div id="tableYear">
            <TrafficCountCompTable
                :apiData="apiData"
                :tableTitle="tableTitle"
                :setColTitle="setColTitle"
                :setRowTitle="setRowTitle"
                :setFieldValue="setFieldValue"
            />
        </div>
    </div>
</template>

<style scoped>

</style>
