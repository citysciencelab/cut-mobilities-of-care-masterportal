<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import {addMissingDataWeek} from "../library/addMissingData.js";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import moment from "moment";

export default {
    name: "TrafficCountWeek",
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
                    fahrrad: addMissingDataWeek("2020-09-07 00:00:00", {
                        "2020-09-07 00:00:00": 1000,
                        "2020-09-08 00:00:00": 4583,
                        "2020-09-09 00:00:00": 300
                    })
                },
                {
                    fahrrad: addMissingDataWeek("2020-09-21 00:00:00", {
                        "2020-09-21 00:00:00": 4321,
                        "2020-09-22 00:00:00": 2000,
                        "2020-09-23 00:00:00": 3000
                    })
                }
            ],

            // props for diagram
            setTooltipValue: (tooltipItem) => {
                return moment(tooltipItem.label, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY") + ": " + thousandsSeparator(tooltipItem.value);
            },
            yAxisTicks: 8,
            renderLabelXAxis: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd");
            },
            renderLabelYAxis: (yValue) => {
                return thousandsSeparator(yValue);
            },
            descriptionYAxis: "Anzahl / Tag",
            renderLabelLegend: (datetime) => {
                const weeknumber = moment(datetime, "YYYY-MM-DD HH:mm:ss").week(),
                    year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");

                return "KW " + weeknumber + " / " + year;
            },

            // props for table
            tableTitle: "Woche",
            setColTitle: datetime => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd");
            },
            setRowTitle: (meansOfTransports, datetime) => {
                let txt = "";

                txt += "KW" + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("WW");
                // for the year (YYYY) we have to add 3 days to get the thursday of the week
                txt += "/" + moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");
                txt += " (" + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd, DD.MM.YYYY") + ")";

                return txt;
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            },
            diagramWeek: "diagramWeek",
            tableWeek: "tableWeek"
        };
    },
    mounted () {
        // TODO: dies muss entfernt werden - ist nur zum Testen.
        Backbone.updateDiagramWeek = () => {
            this.apiData = [
                {
                    fahrrad: addMissingDataWeek("2020-09-07 00:00:00", {
                        "2020-09-07 00:00:00": 1000,
                        "2020-09-08 00:00:00": 4583,
                        "2020-09-09 00:00:00": 5000
                    })
                },
                {
                    fahrrad: addMissingDataWeek("2020-09-21 00:00:00", {
                        "2020-09-21 00:00:00": 4321,
                        "2020-09-22 00:00:00": 2000,
                        "2020-09-23 00:00:00": 4000
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
            :tableDiagramId="diagramWeek"
        />
        <div id="diagramWeek">
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
            :tableDiagramId="tableWeek"
        />
        <div id="tableWeek">
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
