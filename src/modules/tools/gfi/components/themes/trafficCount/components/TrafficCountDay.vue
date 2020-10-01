<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import moment from "moment";
import DatepickerModel from "../../../../../../../../modules/snippets/datepicker/model";
import DatepickerView from "../../../../../../../../modules/snippets/datepicker/view";

export default {
    name: "TrafficCountDay",
    components: {
        TrafficCountCompDiagram,
        TrafficCountCompTable,
        TrafficCountCheckbox
    },
    props: {
        api: {
            type: Object,
            required: true
        },
        thingId: {
            type: Number,
            required: true
        },
        meansOfTransport: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            dayDatepicker: null,
            // TODO: update apiData, mit der update-Funktion der Api
            apiData: [],

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
            descriptionYAxis: this.$t("common:modules.tools.gfi.themes.trafficCount.yAxisTextDay"),
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
            },
            dayInterval: "15-Min",
            diagramDay: "diagramDay",
            tableDay: "tableDay"
        };
    },
    mounted () {
        this.setDayDatepicker();
    },
    methods: {
        setDayDatepicker: function () {
            const startDate = moment().subtract(7, "days");

            if (!this.dayDatepicker) {
                this.dayDatepicker = new DatepickerModel({
                    displayName: "Tag",
                    multidate: 5,
                    preselectedValue: moment().toDate(),
                    startDate: startDate.toDate(),
                    endDate: moment().toDate(),
                    type: "datepicker",
                    inputs: $("#dayDateInput"),
                    todayHighlight: false,
                    language: i18next.language
                });

                this.dayDatepicker.on("valuesChanged", function (evt) {
                    let date = evt.attributes.date;

                    if (date && !Array.isArray(date)) {
                        date = [date];
                    }
                    this.dayDatepickerValueChanged(date);
                }.bind(this));

                if (document.querySelector("#dayDateSelector")) {
                    document.querySelector("#dayDateSelector").appendChild(new DatepickerView({model: this.dayDatepicker}).render().el);
                }
                this.dayDatepicker.updateValues(moment().toDate());
            }
            else if (document.querySelector("#dayDateSelector")) {
                document.querySelector("#dayDateSelector").appendChild(new DatepickerView({model: this.dayDatepicker}).render().el);
            }
        },

        /**
         * Function is initially triggered and on update
         * @param   {Date} dates an unsorted array of selected dates of weekday
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {void}
         */
        dayDatepickerValueChanged: function (dates) {
            const api = this.api,
                thingId = this.thingId,
                meansOfTransport = this.meansOfTransport,
                timeSettings = [];

            if (dates.length === 0) {
                this.apiData = [];
            }
            else {
                dates.sort((earlyDate, lateDate) => {
                    // Showing earlier date first
                    return earlyDate - lateDate;
                }).forEach(date => {
                    const fromDate = moment(date).format("YYYY-MM-DD");

                    timeSettings.push({
                        interval: this.dayInterval,
                        from: fromDate,
                        until: fromDate
                    });
                });

                api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {
                    this.apiData = datasets;
                }, errormsg => {
                    this.apiData = [];

                    console.warn("The data received from api are incomplete:", errormsg);
                    Radio.trigger("Alert", "alert", {
                        content: "Die gewünschten Daten wurden wegen eines API-Fehlers nicht korrekt empfangen.",
                        category: "Info"
                    });
                });
            }
        },

        /**
         * opens the calender
         * @param   {Event} evt click event
         * @returns {void}
         */
        toggleCalendar: function (evt) {
            const input = document.getElementById(evt.currentTarget.id).parentNode.parentNode.querySelector("input");

            input.focus();
        }
    }
};
</script>

<template>
    <div>
        <div
            id="dayDateSelector"
            class="dateSelector"
        >
            <div class="input-group">
                <input
                    id="dayDateInput"
                    type="text"
                    class="form-control dpinput"
                    placeholder="Datum"
                >
                <span class="input-group-btn">
                    <button
                        id="dayDateInputButton"
                        class="btn btn-default"
                        type="button"
                        @click="toggleCalendar"
                    >
                        <span
                            class="glyphicon glyphicon-th"
                            aria-hidden="true"
                        ></span>
                    </button>
                </span>
            </div>
        </div>
        <TrafficCountCheckbox
            :tableDiagramId="diagramDay"
        />
        <div id="diagramDay">
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
        </div>
        <TrafficCountCheckbox
            :tableDiagramId="tableDay"
        />
        <div id="tableDay">
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
