<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import moment from "moment";
import DatepickerModel from "../../../../../../../../modules/snippets/datepicker/model";
import DatepickerView from "../../../../../../../../modules/snippets/datepicker/view";

export default {
    name: "TrafficCountYear",
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
            yearDatepicker: null,
            apiData: [],

            // props for diagram
            setTooltipValue: (tooltipItem) => {
                // add 3 days to match thursdays
                const objMoment = moment(tooltipItem.label, "YYYY-MM-DD HH:mm:ss").add(3, "days");

                return this.$t("common:modules.tools.gfi.themes.trafficCount.calendarweek") + " " + objMoment.format("WW") + " / " + objMoment.format("YYYY") + ": " + thousandsSeparator(tooltipItem.value);
            },
            yAxisTicks: 8,
            renderLabelXAxis: (datetime) => {
                // add 3 days to match thursdays
                const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days");

                return this.$t("common:modules.tools.gfi.themes.trafficCount.calendarweek") + objMoment.format("WW");
            },
            renderLabelYAxis: (yValue) => {
                return thousandsSeparator(yValue);
            },
            descriptionYAxis: this.$t("common:modules.tools.gfi.themes.trafficCount.yAxisTextYear"),
            renderLabelLegend: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");
            },

            // props for table
            tableTitle: this.$t("common:modules.tools.gfi.themes.trafficCount.yearLabel"),
            setColTitle: datetime => {
                return this.$t("common:modules.tools.gfi.themes.trafficCount.calendarweek") + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("WW");
            },
            setRowTitle: (meansOfTransports, datetime) => {
                // datetime is the monday of the week - so we have to add 3 days to get the thursday of the week
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            },
            yearInterval: "1-Woche",
            diagramYear: "diagramYear",
            tableYear: "tableYear"
        };
    },
    mounted () {
        this.setYearDatepicker();
    },
    methods: {
        /**
         * Setup of the year tab.
         * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
         * @listens Snippets#ValuesChanged
         * @returns {Void}  -
         */
        setYearDatepicker: function () {
            const startDate = moment("2020-01-01");

            // create datepicker only on first enter of tab
            if (!this.yearDatepicker) {
                this.yearDatepicker = new DatepickerModel({
                    displayName: "Tag",
                    preselectedValue: moment().startOf("year").toDate(),
                    multidate: 5,
                    startDate: startDate.toDate(),
                    endDate: moment().startOf("year").toDate(),
                    type: "datepicker",
                    minViewMode: "years",
                    maxViewMode: "years",
                    inputs: $("#yearDateInput"),
                    format: "yyyy",
                    language: i18next.language
                });

                this.yearDatepicker.on("valuesChanged", function (evt) {
                    let date = evt.attributes.date;

                    if (date && !Array.isArray(date)) {
                        date = [date];
                    }
                    this.yearDatepickerValueChanged(date);
                }.bind(this));

                if (document.querySelector("#yearDateSelector")) {
                    document.querySelector("#yearDateSelector").appendChild(new DatepickerView({model: this.yearDatepicker}).render().el);
                }
                this.yearDatepicker.updateValues(moment().toDate());
            }
            else if (document.querySelector("#yearDateSelector")) {
                document.querySelector("#yearDateSelector").appendChild(new DatepickerView({model: this.yearDatepicker}).render().el);
            }
        },

        /** Function is initially triggered and on update
         * @param   {Date} dates an unsorted array of first day date of selected year
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {void}
         */
        yearDatepickerValueChanged: function (dates) {
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
                    timeSettings.push({
                        interval: this.yearInterval,
                        // subtract 3 days to savely include the first thursday of january into the interval, as the first calendar week always includes the first thursday of january
                        from: moment(date).startOf("year").subtract(3, "days").format("YYYY-MM-DD"),
                        // add 3 days to savely include the last thursday of december into the interval, as the last calendar week always includes the last thursday of december
                        until: moment(date).endOf("year").add(3, "days").format("YYYY-MM-DD"),
                        selectedYear: moment(date).format("YYYY")
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
         * @returns {void}
         */
        toggleCalendar: function () {
            const input = this.$el.querySelector("input");

            input.focus();
        }
    }
};
</script>

<template>
    <div>
        <div
            id="yearDateSelector"
            class="dateSelector"
        >
            <div class="input-group">
                <input
                    id="yearDateInput"
                    type="text"
                    class="form-control dpinput"
                    placeholder="Datum"
                >
                <span class="input-group-btn">
                    <button
                        id="yearDateInputButton"
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
