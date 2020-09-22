<script>
import moment from "moment";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator";

export default {
    name: "TrafficCountInfo",
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
            totalDesc: "",
            totalValue: "",
            thisYearDesc: "",
            thisYearValue: "",
            lastYearDesc: "",
            lastYearValue: "",
            lastDayDesc: "",
            lastDayValue: "",
            highestWorkloadDayDesc: "",
            highestWorkloadDayValue: "",
            highestWorkloadWeekDesc: "",
            highestWorkloadWeekValue: "",
            highestWorkloadMonthDesc: "",
            highestWorkloadMonthValue: ""
        };
    },
    computed: {
        period: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.period");
        },

        number: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.number");
        },

        totalSince: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.totalSince");
        },

        sinceBeginningOfTheYear: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.sinceBeginningOfTheYear");
        },

        overThePastYear: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.overThePastYear");
        },

        onThePreviousDay: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.onThePreviousDay");
        },

        highestDay: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.highestDay");
        },

        highestWeek: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.highestWeek");
        },

        highestMonth: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.highestMonth");
        },

        calendarweek: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.calendarweek");
        }
    },
    watch: {
        // When the gfi window switched with arrow, the new data will be fetched from api
        thingId: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    this.setupTabInfo(this.api, newVal, this.meansOfTransport);
                }
            },
            immediate: true
        }
    },
    mounted: function () {
        this.setupTabInfo(this.api, this.thingId, this.meansOfTransport);
    },
    methods: {
        /**
         * setup of the info tab
         * @param {Object} api instance of TrafficCountApi
         * @param {String} thingId the thingId to be send to any api call
         * @param {String} meansOfTransport the meansOfTransport to be send with any api call
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {Void}  -
         */
        setupTabInfo: function (api, thingId, meansOfTransport) {
            api.updateTotal(thingId, meansOfTransport, (date, value) => {
                this.setTotalDesc(typeof date === "string" ? moment(date, "YYYY-MM-DD").format("DD.MM.YYYY") : "");
                this.setTotalValue(thousandsSeparator(value));
            }, errormsg => {
                this.setTotalDesc("(nicht");
                this.setTotalValue("empfangen)");
                console.warn("The last update total is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"insgesamt seit\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });

            api.updateYear(thingId, meansOfTransport, moment().format("YYYY"), (year, value) => {
                this.setThisYearDesc(typeof year === "string" ? "01.01." + year : "");
                this.setThisYearValue(thousandsSeparator(value));
            }, errormsg => {
                this.setThisYearDesc("(nicht");
                this.setThisYearValue("empfangen)");
                console.warn("The last update year is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"seit Jahresbeginn\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });

            api.updateYear(thingId, meansOfTransport, moment().subtract(1, "year").format("YYYY"), (year, value) => {
                this.setLastYearDesc(typeof year === "string" ? year : "");
                this.setLastYearValue(thousandsSeparator(value));
            }, errormsg => {
                this.setLastYearDesc("(nicht");
                this.setLastYearValue("empfangen)");
                console.warn("The last update last year is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"im Vorjahr\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });

            api.updateDay(thingId, meansOfTransport, moment().subtract(1, "day").format("YYYY-MM-DD"), (date, value) => {
                this.setLastDayDesc(typeof date === "string" ? moment(date, "YYYY-MM-DD").format("DD.MM.YYYY") : "");
                this.setLastDayValue(thousandsSeparator(value));
            }, errormsg => {
                this.setLastDayDesc("(nicht");
                this.setLastDayValue("empfangen)");
                console.warn("The last update last day is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"am Vortag\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });

            api.updateHighestWorkloadDay(thingId, meansOfTransport, moment().format("YYYY"), (date, value) => {
                this.setHighestWorkloadDayDesc(typeof date === "string" ? moment(date, "YYYY-MM-DD").format("DD.MM.YYYY") : "");
                this.setHighestWorkloadDayValue(thousandsSeparator(value));
            }, errormsg => {
                this.setHighestWorkloadDayDesc("(nicht");
                this.setHighestWorkloadDayValue("empfangen)");
                console.warn("The last update HighestWorkloadDay is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"Stärkster Tag im Jahr\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });

            api.updateHighestWorkloadWeek(thingId, meansOfTransport, moment().format("YYYY"), (calendarWeek, value) => {
                this.setHighestWorkloadWeekDesc(!isNaN(calendarWeek) || typeof calendarWeek === "string" ? this.calendarweek + " " + calendarWeek : "");
                this.setHighestWorkloadWeekValue(thousandsSeparator(value));
            }, errormsg => {
                this.setHighestWorkloadWeekDesc("(nicht");
                this.setHighestWorkloadWeekValue("empfangen)");
                console.warn("The last update HighestWorkloadWeek is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"Stärkste Woche im Jahr\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });

            api.updateHighestWorkloadMonth(thingId, meansOfTransport, moment().format("YYYY"), (month, value) => {
                this.setHighestWorkloadMonthDesc(typeof month === "string" ? month : "");
                this.setHighestWorkloadMonthValue(thousandsSeparator(value));
            }, errormsg => {
                this.setHighestWorkloadMonthDesc("(nicht");
                this.setHighestWorkloadMonthValue("empfangen)");
                console.warn("The last update HighestWorkloadMonth is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der Wert für \"Stärkster Monat im Jahr\" wurde wegen eines API-Fehlers nicht empfangen.",
                    category: "Info"
                });
            });
        },

        /**
         * setter for the description of total
         * @param {String} value the description
         * @returns {Void}  -
         */
        setTotalDesc: function (value) {
            this.totalDesc = value;
        },

        /**
         * setter for the value of total
         * @param {String} value the value
         * @returns {Void}  -
         */
        setTotalValue: function (value) {
            this.totalValue = value;
        },

        /**
         * setter for the description of thisYearDesc
         * @param {String} value the description
         * @returns {Void}  -
         */
        setThisYearDesc: function (value) {
            this.thisYearDesc = value;
        },

        /**
         * setter for the value of thisYearValue
         * @param {String} value the value
         * @returns {Void}  -
         */
        setThisYearValue: function (value) {
            this.thisYearValue = value;
        },

        /**
         * setter for the description of lastYearDesc
         * @param {String} value the description
         * @returns {Void}  -
         */
        setLastYearDesc: function (value) {
            this.lastYearDesc = value;
        },

        /**
         * setter for the value of lastYearValue
         * @param {String} value the value
         * @returns {Void}  -
         */
        setLastYearValue: function (value) {
            this.lastYearValue = value;
        },

        /**
         * setter for the description of lastDayDesc
         * @param {String} value the description
         * @returns {Void}  -
         */
        setLastDayDesc: function (value) {
            this.lastDayDesc = value;
        },

        /**
         * setter for the value of lastDayValue
         * @param {String} value the value
         * @returns {Void}  -
         */
        setLastDayValue: function (value) {
            this.lastDayValue = value;
        },

        /**
         * setter for the description of highestWorkloadDayDesc
         * @param {String} value the description
         * @returns {Void}  -
         */
        setHighestWorkloadDayDesc: function (value) {
            this.highestWorkloadDayDesc = value;
        },

        /**
         * setter for the value of highestWorkloadDayValue
         * @param {String} value the value
         * @returns {Void}  -
         */
        setHighestWorkloadDayValue: function (value) {
            this.highestWorkloadDayValue = value;
        },

        /**
         * setter for the description of highestWorkloadWeekDesc
         * @param {String} value the description
         * @returns {Void}  -
         */
        setHighestWorkloadWeekDesc: function (value) {
            this.highestWorkloadWeekDesc = value;
        },

        /**
         * setter for the value of highestWorkloadWeekValue
         * @param {String} value the value
         * @returns {Void}  -
         */
        setHighestWorkloadWeekValue: function (value) {
            this.highestWorkloadWeekValue = value;
        },

        /**
         * setter for the description of highestWorkloadMonthDesc
         * @param {String} value the description
         * @returns {Void}  -
         */
        setHighestWorkloadMonthDesc: function (value) {
            this.highestWorkloadMonthDesc = value;
        },

        /**
         * setter for the value of highestWorkloadMonthValue
         * @param {String} value the value
         * @returns {Void}  -
         */
        setHighestWorkloadMonthValue: function (value) {
            this.highestWorkloadMonthValue = value;
        }
    }
};
</script>

<template>
    <div
        id="infos"
        class="infos tab-pane fade in active"
    >
        <div class="padded">
            <table class="table table-hover table-striped">
                <tbody>
                    <tr colspan="3">
                        <td class="bold">
                        &nbsp;
                        </td>
                        <td class="bold">
                            {{ period }}
                        </td>
                        <td class="bold">
                            {{ number }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ totalSince }}
                        </td>
                        <td
                            id="totalDesc"
                            class="text-right"
                        >
                            {{ totalDesc }}
                        </td>
                        <td
                            id="totalValue"
                            class="text-right"
                        >
                            {{ totalValue }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ sinceBeginningOfTheYear }}
                        </td>
                        <td
                            id="thisYearDesc"
                            class="text-right"
                        >
                            {{ thisYearDesc }}
                        </td>
                        <td
                            id="thisYearValue"
                            class="text-right"
                        >
                            {{ thisYearValue }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ overThePastYear }}
                        </td>
                        <td
                            id="lastYearDesc"
                            class="text-right"
                        >
                            {{ lastYearDesc }}
                        </td>
                        <td
                            id="lastYearValue"
                            class="text-right"
                        >
                            {{ lastYearValue }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ onThePreviousDay }}
                        </td>
                        <td
                            id="lastDayDesc"
                            class="text-right"
                        >
                            {{ lastDayDesc }}
                        </td>
                        <td
                            id="lastDayValue"
                            class="text-right"
                        >
                            {{ lastDayValue }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ highestDay }}
                        </td>
                        <td
                            id="highestWorkloadDayDesc"
                            class="text-right"
                        >
                            {{ highestWorkloadDayDesc }}
                        </td>
                        <td
                            id="highestWorkloadDayValue"
                            class="text-right"
                        >
                            {{ highestWorkloadDayValue }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ highestWeek }}
                        </td>
                        <td
                            id="highestWorkloadWeekDesc"
                            class="text-right"
                        >
                            {{ highestWorkloadWeekDesc }}
                        </td>
                        <td
                            id="highestWorkloadWeekValue"
                            class="text-right"
                        >
                            {{ highestWorkloadWeekValue }}
                        </td>
                    </tr>
                    <tr colspan="3">
                        <td class="bold">
                            {{ highestMonth }}
                        </td>
                        <td
                            id="highestWorkloadMonthDesc"
                            class="text-right"
                        >
                            {{ highestWorkloadMonthDesc }}
                        </td>
                        <td
                            id="highestWorkloadMonthValue"
                            class="text-right"
                        >
                            {{ highestWorkloadMonthValue }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>

</style>
