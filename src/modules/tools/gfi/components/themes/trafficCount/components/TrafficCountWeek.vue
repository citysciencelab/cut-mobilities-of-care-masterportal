<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import moment from "moment";
import DatepickerModel from "../../../../../../../../modules/snippets/datepicker/model";
import DatepickerView from "../../../../../../../../modules/snippets/datepicker/view";
import {addMissingDataWeek} from "../library/addMissingData.js";

export default {
    name: "TrafficCountWeek",
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
            weekDatepicker: null,
            apiData: [],

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
            descriptionYAxis: i18next.t("common:modules.tools.gfi.themes.trafficCount.yAxisTextWeek"),
            renderLabelLegend: (datetime) => {
                const weeknumber = moment(datetime, "YYYY-MM-DD HH:mm:ss").week(),
                    year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");

                return this.calendarweek + " " + weeknumber + " / " + year;
            },

            // props for table
            tableTitle: i18next.t("common:modules.tools.gfi.themes.trafficCount.weekLabel"),
            setColTitle: datetime => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd");
            },
            setRowTitle: (meansOfTransports, datetime) => {
                let txt = "";

                txt += this.calendarweek + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("WW");
                // for the year (YYYY) we have to add 3 days to get the thursday of the week
                txt += "/" + moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");
                txt += " (" + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd, DD.MM.YYYY") + ")";

                return txt;
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            },
            weekInterval: "1-Tag",
            diagramWeek: "diagramWeek",
            tableWeek: "tableWeek"
        };
    },
    computed: {
        calendarweek: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.calendarweek");
        }
    },
    mounted () {
        moment.locale(i18next.language);
        this.setWeekdatepicker();
    },
    methods: {
        setWeekdatepicker: function () {
            const startDate = moment("2020-01-01") > moment().subtract(1, "year") ? moment("2020-01-01") : moment().subtract(1, "year");

            if (!this.weekDatepicker) {
                this.weekDatepicker = new DatepickerModel({
                    preselectedValue: moment().toDate(),
                    multidate: 5,
                    startDate: startDate.toDate(),
                    endDate: moment().toDate(),
                    type: "datepicker",
                    selectWeek: true,
                    inputs: $("#weekDateInput"),
                    calendarWeeks: true,
                    format: {
                        toDisplay: function (date) {
                            return moment(date).startOf("isoWeek").format("DD.MM.YYYY") + "-" + moment(date).endOf("isoWeek").format("DD.MM.YYYY");
                        },
                        toValue: function (date) {
                            return moment.utc(date, "DD.MM.YYYY").toDate();
                        }
                    },
                    todayHighlight: false,
                    language: i18next.language
                });

                this.weekDatepicker.on("valuesChanged", function (evt) {
                    let date = evt.attributes.date;

                    if (date && !Array.isArray(date)) {
                        date = [date];
                    }
                    this.weekDatepickerValueChanged(date);
                }.bind(this));

                if (document.querySelector("#weekDateSelector")) {
                    document.querySelector("#weekDateSelector").appendChild(new DatepickerView({model: this.weekDatepicker}).render().el);
                }
                this.weekDatepicker.updateValues(moment().toDate());
            }
            else if (document.querySelector("#weekDateSelector")) {
                document.querySelector("#weekDateSelector").appendChild(new DatepickerView({model: this.weekDatepicker}).render().el);
            }
        },

        /**
         * Function is initially triggered and on update
         * @param   {Date} dates an unsorted array of selected dates of weekday
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {void}
         */
        weekDatepickerValueChanged: function (dates) {
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
                        interval: this.weekInterval,
                        from: moment(date).startOf("isoWeek").format("YYYY-MM-DD"),
                        until: moment(date).endOf("isoWeek").format("YYYY-MM-DD")
                    });
                });

                api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {
                    if (Array.isArray(datasets)) {
                        datasets.forEach((transportData, idx) => {
                            const from = typeof timeSettings[idx] === "object" ? timeSettings[idx].from + " 00:00:00" : "";

                            Object.keys(transportData).forEach(transportKey => {
                                datasets[idx][transportKey] = addMissingDataWeek(from, datasets[idx][transportKey]);
                            });
                        });
                    }

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
            id="weekDateSelector"
            class="dateSelector"
        >
            <div class="input-group">
                <input
                    id="weekDateInput"
                    type="text"
                    class="form-control dpinput"
                    placeholder="Datum"
                >
                <span class="input-group-btn">
                    <button
                        id="weekDateInputButton"
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
