<script>
import {mapGetters} from "vuex";

import {TrafficCountCache} from "../library/trafficCountCache";
import TrafficCountInfo from "./TrafficCountInfo.vue";
import TrafficCountDay from "./TrafficCountDay.vue";
import TrafficCountWeek from "./TrafficCountWeek.vue";
import TrafficCountYear from "./TrafficCountYear.vue";
import TrafficCountFooter from "./TrafficCountFooter.vue";

export default {
    name: "TrafficCount",
    components: {
        TrafficCountInfo,
        TrafficCountDay,
        TrafficCountWeek,
        TrafficCountYear,
        TrafficCountFooter
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            api: null,
            propThingId: 0,
            propMeansOfTransport: "",
            title: "",
            type: "",
            meansOfTransport: "",
            direction: "",
            currentTabId: "infos",
            keyInfo: "info",
            keyDay: "day",
            keyWeek: "week",
            keyYear: "year"
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        infoLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.infoLabel");
        },

        dayLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.dayLabel");
        },

        weekLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.weekLabel");
        },

        yearLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.yearLabel");
        },

        typeAssoc: function () {
            return {
                AnzFahrzeuge: this.$t("common:modules.tools.gfi.themes.trafficCount.infraredsensor"),
                Anzahl_Fahrraeder: this.$t("common:modules.tools.gfi.themes.trafficCount.countingstation")
            };
        },

        meansOfTransportAssoc: function () {
            return {
                AnzFahrzeuge: this.$t("common:modules.tools.gfi.themes.trafficCount.carLabel"),
                Anzahl_Fahrraeder: this.$t("common:modules.tools.gfi.themes.trafficCount.bicycleLabel")
            };
        },

        idLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.idLabel");
        },

        typeLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.typeLabel");
        },

        meansOfTransportLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.meansOfTransportLabel");
        },

        directionLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.directionLabel");
        }
    },
    watch: {
        // When the gfi window switched with arrow, the connection will be refreshed
        feature: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    this.createDataConnection(newVal.getProperties(), null);
                    this.setHeader(this.api, this.propThingId, this.propMeansOfTransport);
                    this.setComponentKey(this.propThingId);
                    this.setActiveDefaultTab();
                }
            },
            immediate: true
        },

        // When language is switched, the header will be rerendered
        currentLocale: function (newVal, oldVal) {
            if (oldVal) {
                this.setHeader(this.api, this.propThingId, this.propMeansOfTransport);
                this.setComponentKey(newVal);
                this.setActiveDefaultTab();
            }
        }
    },
    created: function () {
        this.createDataConnection(this.feature.getProperties(), null);
    },
    mounted: function () {
        this.setHeader(this.api, this.propThingId, this.propMeansOfTransport);
    },
    beforeDestroy: function () {
        this.api.unsubscribeEverything();
    },
    methods: {
        /**
         * it will make conntection to thing api
         * @param {Object[]} feature the feature properties from thing
         * @param {Object} [sensorThingsApiOpt=null] an optional api for testing
         * @returns {Void} -
         */
        createDataConnection: function (feature, sensorThingsApiOpt = null) {
            const thingId = feature["@iot.id"],
                meansOfTransport = this.getMeansOfTransportFromDatastream(feature.Datastreams, Object.keys(this.typeAssoc)),
                url = feature.requestUrl,
                sensorThingsApiVersion = "v" + feature.versionUrl,
                mqttOptions = {
                    mqttUrl: "wss://" + url.split("/")[2] + "/mqtt",
                    mqttVersion: "3.1.1",
                    rhPath: url,
                    context: this
                };

            this.api = new TrafficCountCache(url, sensorThingsApiVersion, mqttOptions, sensorThingsApiOpt);
            this.propThingId = thingId;
            this.propMeansOfTransport = meansOfTransport;
        },

        /**
         * returns the value in meansOfTransportArray that matches the start of the given array of datastreams property layerName, returns first match
         * @param {Object[]} datastreams the array of datastreams from the SensorThingsAPI
         * @param {String[]} meansOfTransportArray an array representing all terms to look for in the datastreams layerName
         * @returns {String|Boolean}  a string representing the means of transport (e.g. AnzFahrzeuge, AnzFahrräder) or false if no means of transport where found
         */
        getMeansOfTransportFromDatastream: function (datastreams, meansOfTransportArray) {
            let key,
                i,
                datastream = null;

            if (!Array.isArray(datastreams) || datastreams.length === 0) {
                return false;
            }

            for (i in datastreams) {
                datastream = datastreams[i];

                if (!datastream || typeof datastream !== "object" || !datastream.hasOwnProperty("properties") || !datastream.properties.hasOwnProperty("layerName")) {
                    continue;
                }

                for (key in meansOfTransportArray) {
                    if (datastream.properties.layerName.indexOf(meansOfTransportArray[key]) === 0) {
                        return meansOfTransportArray[key];
                    }
                }
            }

            return false;
        },

        /**
         * set the default infos tab active when switch the language by triggering the click event
         * @returns {Void} -
         */
        setActiveDefaultTab: function () {
            this.$el.querySelector("li[value='infos'] a").click();
        },

        /**
         * set the current tab id after clicking.
         * @param {Object[]} evt the target of current click event
         * @returns {Void} -
         */
        setCurrentTabId: function (evt) {
            if (evt && evt.target && evt.target.hash) {
                this.currentTabId = evt.target.hash.substring(1);
            }
        },

        /**
         * set the header of gfi theme
         * @param {Object} api the api from library
         * @param {String} thingId the current thing Id
         * @param {String} meansOfTransport the means of transportation
         * @returns {Void} -
         */
        setHeader: function (api, thingId, meansOfTransport) {
            // title
            api.updateTitle(thingId, title => {
                this.setTitle(title);
            }, errormsg => {
                this.setTitle("(kein Titel empfangen)");
                console.warn("The title received is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Der vom Sensor-Server erhaltene Titel des geöffneten GFI konnte wegen eines API-Fehlers nicht empfangen werden.",
                    category: "Info"
                });
            });

            // type
            if (meansOfTransport && this.typeAssoc.hasOwnProperty(meansOfTransport)) {
                this.type = this.typeAssoc[meansOfTransport];
            }
            else {
                this.type = "";
            }

            // means of transport
            if (meansOfTransport && this.meansOfTransportAssoc.hasOwnProperty(meansOfTransport)) {
                this.meansOfTransport = this.meansOfTransportAssoc[meansOfTransport];
            }
            else {
                this.meansOfTransport = "";
            }

            // direction
            api.updateDirection(thingId, direction => {
                this.setDirection(direction);
            }, errormsg => {
                this.setDirection("");
                console.warn("The direction received is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Die vom Sensor-Server erhaltene Richtung des geöffneten GFI konnte wegen eines API-Fehlers nicht empfangen werden.",
                    category: "Info"
                });
            });
        },

        /**
         * setter for title
         * @param {String} value the title to be shown in the template
         * @returns {Void}  -
         */
        setTitle: function (value) {
            this.title = value;
        },

        /**
         * setter for direction
         * @param {String} value the direction to be shown in the template
         * @returns {Void}  -
         */
        setDirection: function (value) {
            this.direction = value;
        },

        /**
         * setter for the compoent key
         * @param {String} value the dynamic changed value from watch hook
         * @returns {Void}  -
         */
        setComponentKey: function (value) {
            this.keyInfo = value + "info";
            this.keyDay = value + "day";
            this.keyWeek = value + "week";
            this.keyYear = value + "year";
        }
    }
};
</script>

<template>
    <div class="trafficCount-gfi">
        <div class="header">
            {{ idLabel }} <span id="title">{{ title }}</span><br>
            {{ typeLabel }} <span id="type">{{ type }}</span><br>
            {{ meansOfTransportLabel }} <span id="meansOfTransport">{{ meansOfTransport }}</span><br>
            {{ directionLabel }} <span id="direction">{{ direction }}</span>
        </div>
        <div>
            <ul
                class="nav nav-pills"
                @click="setCurrentTabId"
            >
                <li
                    value="infos"
                    class="active"
                >
                    <a
                        data-toggle="tab"
                        href="#infos"
                    >{{ infoLabel }}</a>
                </li>
                <li value="day">
                    <a
                        data-toggle="tab"
                        href="#day"
                    >{{ dayLabel }}</a>
                </li>
                <li value="week">
                    <a
                        data-toggle="tab"
                        href="#week"
                    >{{ weekLabel }}</a>
                </li>
                <li value="year">
                    <a
                        data-toggle="tab"
                        href="#year"
                    >{{ yearLabel }}</a>
                </li>
            </ul>
            <div class="tab-content">
                <TrafficCountInfo
                    id="infos"
                    :key="keyInfo"
                    class="tab-pane fade in active"
                    :api="api"
                    :thingId="propThingId"
                    :meansOfTransport="propMeansOfTransport"
                />
                <TrafficCountDay
                    id="day"
                    :key="keyDay"
                    class="tab-pane fade"
                    :api="api"
                    :thingId="propThingId"
                    :meansOfTransport="propMeansOfTransport"
                />
                <TrafficCountWeek
                    id="week"
                    :key="keyWeek"
                    class="tab-pane fade"
                    :api="api"
                    :thingId="propThingId"
                    :meansOfTransport="propMeansOfTransport"
                />
                <TrafficCountYear
                    id="year"
                    :key="keyYear"
                    class="tab-pane fade"
                    :api="api"
                    :thingId="propThingId"
                    :meansOfTransport="propMeansOfTransport"
                />
            </div>
        </div>
        <TrafficCountFooter
            class="footer"
            :currentTabId="currentTabId"
            :api="api"
            :thingId="propThingId"
            :meansOfTransport="propMeansOfTransport"
        />
    </div>
</template>

<style lang="less" scoped>
    .header {
        min-width: 280px;
        max-width: 320px;
        margin: 0 auto;
        padding: 0 60px;
    }
    .footer {
        position: relative;
    }
    .tab-content {
        padding: 5px;
    }
</style>
