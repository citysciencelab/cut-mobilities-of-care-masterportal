<script>
import * as moment from "moment";
import axios from "axios";

import SensorChartsData from "./SensorData.vue";
import SensorChartsBarChart from "./SensorBarChart.vue";
import {processHistoricalDataByWeekdays} from "../library/processHistoricalDataByWeekdays";

export default {
    name: "Sensor",
    components: {
        SensorChartsData,
        SensorChartsBarChart
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: function () {
        return {
            dataName: this.$t("common:modules.tools.gfi.themes.sensor.sensor.dataName"),
            periodLength: 3,
            periodUnit: "month",
            processedHistoricalDataByWeekday: [],
            activeTab: "data",
            startDate: "",
            header: {
                name: this.$t("common:modules.tools.gfi.themes.sensor.sensor.header.name"),
                description: this.$t("common:modules.tools.gfi.themes.sensor.sensor.header.description"),
                ownerThing: this.$t("common:modules.tools.gfi.themes.sensor.sensor.header.ownerThing")
            }
        };
    },
    computed: {
        /**
         * Get the configured gfiParams.
         * @returns {Object} The gfiParams.
         */
        gfiParams: function () {
            return this.feature.getTheme()?.params;
        },

        /**
         * Gets the configured header attributes.
         * @returns {Object} The header attributes.
         */
        getHeader: function () {
            const header = this.gfiParams?.header || this.header;

            // "useConfigName" is set in the preparser, should be removed, with the refactoring of the core
            if (header.hasOwnProperty("useConfigName")) {
                delete header.useConfigName;
            }
            return header;
        },

        /**
         * Gets the values to draw charts.
         * @returns {Object} The chart values.
         */
        chartvalues: function () {
            return this.gfiParams?.charts?.values;
        }
    },
    watch: {
        feature () {
            this.loadHistoricalData();
        }
    },
    created () {
        this.dataName = this.gfiParams?.data?.name || this.dataName;
        this.periodLength = this.gfiParams?.historicalData?.periodLength || this.periodLength;
        this.periodUnit = this.gfiParams?.historicalData?.periodUnit || this.periodUnit;

        this.loadHistoricalData();
    },
    methods: {
        /**
         * Builds the requestQuery to request the historical observations
         * and starts the request for the given period.
         * @returns {void}
         */
        loadHistoricalData: function () {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.feature.getLayerId()}),
                url = model.get("url"),
                version = model.get("version"),
                filterDate = this.createFilterDate(this.periodLength, this.periodUnit),
                filterDataStream = this.createFilterDataStream(this.feature.getProperties()?.dataStreamId),
                requestQuery = `${url}v${version}/Datastreams?$select=@iot.id&$expand=Observations`
                    + `($select=result,phenomenonTime;$orderby=phenomenonTime desc;$filter=phenomenonTime gt ${filterDate})`
                    + `&$filter=${filterDataStream}`;

            this.fetchObservations(requestQuery);
        },

        /**
         * Searches for a date in the past based on the specified period.
         * To determine the last state, an additional buffer of one week is requested.
         * @param {Number} periodLength Length of the period.
         * @param {String} periodUnit Unit of the period.
         * @returns {String} The searched date.
         */
        createFilterDate: function (periodLength, periodUnit) {
            const startDate = moment().subtract(periodLength, periodUnit);

            this.startDate = startDate;
            return startDate.subtract(1, "week").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
        },

        /**
         * Creates a filter to query the passed datastreams.
         * @param {String} dataStreamId The ids of the dataStream separated by " | ".
         * @returns {String} The data stream filter query.
         */
        createFilterDataStream: function (dataStreamId) {
            const dataStreamIds = dataStreamId.split(" | ");
            let dataStreamFilter = "";

            dataStreamIds.forEach((id, index) => {
                if (index === 0) {
                    dataStreamFilter = `@iot.id eq ${id}`;
                }
                else {
                    dataStreamFilter = `${dataStreamFilter} or @iot.id eq ${id}`;
                }
            });

            return dataStreamFilter;
        },

        /**
         * Sends a request to request the observations.
         * If the result contains a nextLink, it will also be requested.
         * @param {String} requestQuery The query to request Observations
         * @returns {void}
         */
        fetchObservations: function (requestQuery) {
            const loadedDataStreamIndices = [];
            let historicalObservations = [];

            axios.get(requestQuery)
                .then(response => {
                    response.data.value.forEach((result, index) => {
                        historicalObservations = historicalObservations.concat(result);
                        if (result.hasOwnProperty("Observations@iot.nextLink")) {
                            this.fetchNextLinks(result["Observations@iot.nextLink"], index, historicalObservations, loadedDataStreamIndices, response.data.value.length);
                        }
                    });
                });
        },

        /**
         * Sends recursively the requests for all nextLinks until all observations are loaded.
         * When all observations are loaded, data processing is started.
         * @param {String} requestQuery The nextLink to request Observations.
         * @param {Number} index The position of the Observations in the historicalData.
         * @param {Object[]} historicalObservations Saves the loaded historical observations.
         * @param {String[]} loadedDataStreamIndices The indices of the datastreams whose observations are already completely loaded.
         * @param {Number} numberOfDataStreams Number of datastreams whose observations is requested.
         * @returns {void}
         */
        fetchNextLinks: function (requestQuery, index, historicalObservations, loadedDataStreamIndices, numberOfDataStreams) {
            axios.get(requestQuery)
                .then(response => {
                    if (response?.data.hasOwnProperty("value")) {
                        historicalObservations[index].Observations = historicalObservations[index].Observations.concat(response.data.value);
                    }
                    if (response?.data.hasOwnProperty("@iot.nextLink")) {
                        this.fetchNextLinks(response.data["@iot.nextLink"], index, historicalObservations, loadedDataStreamIndices, numberOfDataStreams);
                    }
                    else {
                        loadedDataStreamIndices.push(index);

                        if (loadedDataStreamIndices.length === numberOfDataStreams) {
                            this.processedHistoricalDataByWeekday = processHistoricalDataByWeekdays(historicalObservations, this.startDate);
                        }
                    }
                });
        },

        /**
         * Checks if the given tab name is currently active.
         * @param {Object|String} tab The tab name.
         * @returns {Boolean} Is true if the given tab name is active.
         */
        isActiveTab (tab) {
            return this.activeTab === tab;
        },

        /**
         * Set the current tab id after clicking if the historicaldata be loaded
         * @param {Object[]} evt The target of current click event.
         * @returns {void}
         */
        setActiveTab (evt) {
            if (evt?.target?.hash && this.processedHistoricalDataByWeekday.length > 0) {
                this.activeTab = evt.target.hash.substring(1);
            }
        },

        /**
         * Returns the classnames for the tab.
         * @param {Object|String} tab The name of the tab depending on property activeTab.
         * @returns {String} The classNames of the tab.
         */
        getTabPaneClasses (tab) {
            return {active: this.isActiveTab(tab), in: this.isActiveTab(tab), "tab-pane": true, fade: true};
        },

        /**
         * Creates an href from the given value.
         * @param {String} value The value.
         * @returns {String} The created href
         */
        createHref: function (value) {
            return `#${value}`;
        }
    }
};
</script>

<template>
    <div class="sensor-text">
        <div
            v-if="header"
            class="sensor-text-align-center"
        >
            <strong
                v-for="(value, key) in getHeader"
                :key="key"
            >
                {{ value + ": " + feature.getProperties()[key] }}
                <br>
            </strong>
        </div>
        <div>
            <ul class="nav nav-pills">
                <li
                    :value="dataName"
                    :class="{
                        active: isActiveTab('data')
                    }"
                >
                    <a
                        data-toggle="tab"
                        href="#data"
                        @click="setActiveTab"
                    >
                        {{ dataName }}
                    </a>
                </li>
                <li
                    v-for="(value, key) in chartvalues"
                    :key="key"
                    value="value?.title || value"
                    :class="{
                        active: isActiveTab(encodeURIComponent(value.title || value)),
                        disabled: processedHistoricalDataByWeekday.length === 0
                    }"
                >
                    <a
                        data-toggle="tab"
                        :href="processedHistoricalDataByWeekday.length === 0 ? '' : createHref(encodeURIComponent(value.title || value))"
                        @click="setActiveTab"
                    >
                        {{ value.title || value }}
                    </a>
                </li>
            </ul>
        </div>
        <div>
            <SensorChartsData
                id="data"
                key="sensorCharts-dataComponent"
                :show="isActiveTab('data')"
                :class="getTabPaneClasses('data')"
                :feature="feature"
            />
            <SensorChartsBarChart
                v-for="(value, key) in chartvalues"
                :key="`sensorCharts-barChartComponent-${key}`"
                :class="getTabPaneClasses(encodeURIComponent(value.title || value))"
                :show="isActiveTab(encodeURIComponent(value.title || value))"
                :chartValue="typeof value === 'object' ? value : {title: value}"
                :targetValue="typeof key === 'number' ? value : key"
                :chartsParams="gfiParams.charts"
                :periodLength="periodLength"
                :periodUnit="periodUnit"
                :processedHistoricalDataByWeekday="processedHistoricalDataByWeekday"
            />
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .sensor-text-align-center {
        text-align: center;
    }
    .sensor-text {
        width: 65vh;
        height: 45vh;
    }
</style>
