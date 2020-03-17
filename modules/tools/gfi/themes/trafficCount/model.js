import Theme from "../model";
import {TrafficCountApi} from "./trafficCountApi";
import moment from "moment";

const TrafficCountModel = Theme.extend(/** @lends TrafficCountModel.prototype*/{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        propTrafficCountApi: null,
        propThingId: 0,
        propMeansOfTransport: "",

        title: "",
        type: "",
        meansOfTransport: "",
        lastUpdate: "",

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
        highestWorkloadMonthValue: "",
        /**
         * due to events order (isReady -> isVisible)
         * but isReady is not fired on gfi toggle
         * and isVisible is fired before the gfi can be rendered
         * this parameter holds the state
         * @type {Boolean}
         */
        isCreated: false,
        typeAssoc: {
            AnzFahrzeuge: "Infrarotsensor",
            AnzFahrraeder: "Zählstation",
            Todo___AnzFahrraederSaeule: "Zählsäule"
        },
        meansOfTransportAssoc: {
            AnzFahrzeuge: "Kfz",
            AnzFahrraeder: "Fahrräder",
            Todo___AnzFahrraederSaeule: "Fahrräder"
        }
    }),


    /**
     * @class TrafficCountModel
     * @description This theme is used to show trafficCount data for Radzählstationen, Radzählsäulen and aVME data
     * @memberof Tools.GFI.Themes.TrafficCount
     * @listens GFI#RadioTriggerGFISetIsVisible
     * @constructs
     * @property {Object} feature feature to show gfi.
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isVisible": this.onIsVisibleEvent
        });
        this.listenTo(Radio.channel("GFI"), {
            "isVisible": this.onGFIIsVisibleEvent
        }, this);

        // change language from moment.js to german
        moment.locale("de");
    },

    /**
     * Fired when GFI visibility changes
     * @param   {boolean} visible gfi visibility
     * @returns {void}
     */
    onGFIIsVisibleEvent: function (visible) {
        if (visible === false) {
            this.onIsVisibleEvent(null, false);
            this.stopListening(Radio.channel("GFI"), "isVisible");
        }
    },

    /**
     * Toggles the visibility of this GFI according to its visibitily.
     * @param   {object}  gfi       gfi object
     * @param   {Boolean} isVisible is gfi visible
     * @returns {void}
     */
    onIsVisibleEvent: function (gfi, isVisible) {
        // make sure to check on 'isVisible' and 'isCreated' to avoid problems mith multiple trafficCount in one opened gfi
        if (!isVisible && this.get("isCreated") === true) {
            this.destroy();
            this.set("isCreated", false);
        }
        else if (isVisible && this.get("isCreated") === false) {
            this.create();
            this.set("isCreated", true);
        }
    },

    /**
     * initialize the info tab
     * @returns {void}
     */
    create: function () {
        const feature = this.get("feature"),
            thingId = feature.get("@iot.id"),
            meansOfTransport = this.getMeansOfTransportFromDatastream(feature.get("Datastreams"), Object.keys(this.get("typeAssoc"))),
            url = feature.get("requestUrl"),
            sensorThingsApiVersion = "v" + feature.get("versionUrl"),
            mqttOptions = {
                host: feature.get("requestUrl").split("/")[2],
                protocol: "wss",
                path: "/mqtt",
                context: this
            };

        this.setPropTrafficCountApi(new TrafficCountApi(url, sensorThingsApiVersion, mqttOptions));
        this.setPropThingId(thingId);
        this.setPropMeansOfTransport(meansOfTransport);

        // init the tab for infos
        this.toggleTab("infos");
    },

    /**
     * remove this model
     * @returns {void}
     */
    destroy: function () {
        const api = this.get("propTrafficCountApi");

        api.unsubscribeEverything();
        this.clear({silent: true});
        this.unbind();
    },

    /**
     * to be called on toggle of a tab
     * @param {String} tabValue the value of the target element (info, day, week, year)
     * @returns {Void}  -
     */
    toggleTab: function (tabValue) {
        const api = this.get("propTrafficCountApi"),
            thingId = this.get("propThingId"),
            meansOfTransport = this.get("propMeansOfTransport");

        api.unsubscribeEverything();

        // title
        api.updateTitle(thingId, title => {
            this.setTitle(title);
        });

        // type
        if (meansOfTransport && this.get("typeAssoc").hasOwnProperty(meansOfTransport)) {
            this.setType(this.get("typeAssoc")[meansOfTransport]);
        }
        else {
            this.setType("");
        }

        // means of transport
        if (meansOfTransport && this.get("meansOfTransportAssoc").hasOwnProperty(meansOfTransport)) {
            this.setMeansOfTransport(this.get("meansOfTransportAssoc")[meansOfTransport]);
        }
        else {
            this.setMeansOfTransport("");
        }

        // tab body
        if (tabValue === "day") {
            this.setupTabDay(api, thingId, meansOfTransport);
        }
        else if (tabValue === "week") {
            this.setupTabWeek(api, thingId, meansOfTransport);
        }
        else if (tabValue === "year") {
            this.setupTabYear(api, thingId, meansOfTransport);
        }
        else {
            this.setupTabInfo(api, thingId, meansOfTransport);
        }

        // tab footer
        api.subscribeLastUpdate(thingId, meansOfTransport, phenomenonTime => {
            this.setLastUpdate(this.parsePhenomenonTime(phenomenonTime));
        });
    },

    /**
     * setup of the info tab
     * @param {Object} api instance of TrafficCountApi
     * @param {String} thingId the thingId to be send to any api call
     * @param {String} meansOfTransport the meansOfTransport to be send with any api call
     * @returns {Void}  -
     */
    setupTabInfo: function (api, thingId, meansOfTransport) {
        api.updateTotal(thingId, meansOfTransport, (date, value) => {
            this.setTotalDesc(typeof date === "string" ? moment(date, "YYYY-MM-DD").format("DD.MM.YYYY") : "");
            this.setTotalValue(this.addThousandPoints(value));
        });

        api.updateYear(thingId, meansOfTransport, moment().format("YYYY"), (year, value) => {
            this.setThisYearDesc(typeof year === "string" ? "01.01." + year : "");
            this.setThisYearValue(this.addThousandPoints(value));
        });

        api.updateYear(thingId, meansOfTransport, moment().subtract(1, "year").format("YYYY"), (year, value) => {
            this.setLastYearDesc(typeof year === "string" ? year : "");
            this.setLastYearValue(this.addThousandPoints(value));
        });

        api.updateDay(thingId, meansOfTransport, moment().subtract(1, "day").format("YYYY-MM-DD"), (date, value) => {
            this.setLastDayDesc(typeof date === "string" ? moment(date, "YYYY-MM-DD").format("DD.MM.YYYY") : "");
            this.setLastDayValue(this.addThousandPoints(value));
        });

        api.updateHighestWorkloadDay(thingId, meansOfTransport, moment().format("YYYY"), (date, value) => {
            this.setHighestWorkloadDayDesc(typeof date === "string" ? moment(date, "YYYY-MM-DD").format("DD.MM.YYYY") : "");
            this.setHighestWorkloadDayValue(this.addThousandPoints(value));
        });

        api.updateHighestWorkloadWeek(thingId, meansOfTransport, moment().format("YYYY"), (calendarWeek, value) => {
            this.setHighestWorkloadWeekDesc(typeof calendarWeek === "string" ? calendarWeek : "");
            this.setHighestWorkloadWeekValue(this.addThousandPoints(value));
        });

        api.updateHighestWorkloadMonth(thingId, meansOfTransport, moment().format("YYYY"), (month, value) => {
            this.setHighestWorkloadMonthDesc(typeof month === "string" ? month : "");
            this.setHighestWorkloadMonthValue(this.addThousandPoints(value));
        });
    },

    /**
     * setup of the info tab
     * @param {Object} api instance of TrafficCountApi
     * @param {String} thingId the thingId to be send to any api call
     * @param {String} meansOfTransport the meansOfTransport to be send with any api call
     * @returns {Void}  -
     */
    setupTabDay: function (api, thingId, meansOfTransport) {
        const interval = "15-Min",
            // @todo: fetch from & until from calendar
            from = moment().format("YYYY-MM-DD"),
            until = moment().format("YYYY-MM-DD");

        api.updateDataset(thingId, meansOfTransport, interval, from, until, (dataset) => {
            // @todo: setup diagram and table with dataset
            if (dataset.hasOwnProperty(meansOfTransport)) {
                return false;
            }
            return false;
        });
    },

    /**
     * setup of the info tab
     * @param {Object} api instance of TrafficCountApi
     * @param {String} thingId the thingId to be send to any api call
     * @param {String} meansOfTransport the meansOfTransport to be send with any api call
     * @returns {Void}  -
     */
    setupTabWeek: function (api, thingId, meansOfTransport) {
        const interval = "1-Stunde",
            // @todo: fetch from & until from calendar
            from = "2020-03-16",
            until = moment().format("YYYY-MM-DD");

        api.updateDataset(thingId, meansOfTransport, interval, from, until, (dataset) => {
            // @todo: setup diagram and table with dataset
            if (dataset.hasOwnProperty(meansOfTransport)) {
                return false;
            }
            return false;
        });
    },

    /**
     * setup of the info tab
     * @param {Object} api instance of TrafficCountApi
     * @param {String} thingId the thingId to be send to any api call
     * @param {String} meansOfTransport the meansOfTransport to be send with any api call
     * @returns {Void}  -
     */
    setupTabYear: function (api, thingId, meansOfTransport) {
        const interval = "1-Woche",
            // @todo: fetch from & until from calendar
            from = "2020-01-01",
            until = moment().format("YYYY-MM-DD");

        api.updateDataset(thingId, meansOfTransport, interval, from, until, (dataset) => {
            // @todo: setup diagram and table with dataset
            if (dataset.hasOwnProperty(meansOfTransport)) {
                return false;
            }
            return false;
        });
    },

    /**
     * returns the value in meansOfTransportArray that matches the start of  the given array of datastreams property layerName
     * @param {Object[]} datastreams the array of datastreams from the SensorThingsAPI
     * @param {String[]} meansOfTransportArray an array representing all terms to look for in the datastreams layerName
     * @returns {String|Boolean}  a string representing the means of transport (e.g. AnzFahrzeuge, AnzFahrräder) or false if no means of transport where found
     */
    getMeansOfTransportFromDatastream: function (datastreams, meansOfTransportArray) {
        let key,
            datastream = null;

        if (!Array.isArray(datastreams) || datastreams.length <= 0) {
            return false;
        }

        datastream = datastreams[0];

        if (!datastream || typeof datastream !== "object" || !datastream.hasOwnProperty("properties") || !datastream.properties.hasOwnProperty("layerName")) {
            return false;
        }

        for (key in meansOfTransportArray) {
            if (datastream.properties.layerName.indexOf(meansOfTransportArray[key]) === 0) {
                return meansOfTransportArray[key];
            }
        }

        return false;
    },

    /**
     * adds thousands points into a absolute number
     * @param {Integer} value the absolute number as integer
     * @returns {String}  the same number but with thousands points or "0" if an invalid value was given
     */
    addThousandPoints: function (value) {
        if (typeof value !== "number" && typeof value !== "string") {
            return "0";
        }

        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    /**
     * checks a phenomenonTime for interval, if not phenomenonTime is returned, if so the last part of the interval is returned, parses phenomenonTime into a readable datetime
     * @info phenomenonTime could be either "2020-03-16T14:30:01.000Z" or "2020-03-16T14:30:01.000Z/2020-03-16T14:45:00.000Z"
     * @param {String} phenomenonInterval the phenomenonTime either as value or interval (see info)
     * @returns {String} the phenomenonTime in format DD.MM.YYYY, HH:II:SS or an empty string if the input was incorrect
     */
    parsePhenomenonTime: function (phenomenonInterval) {
        const phenomenonArray = phenomenonInterval.split("/"),
            phenomenonTime = phenomenonArray[phenomenonArray.length - 1],
            dt = new Date(phenomenonTime);

        return moment(dt).format("DD.MM.YYYY, HH:mm:ss");
    },

    /**
     * setter for propTrafficCountAPI
     * @param {Object} value an instance of TrafficCountApi
     * @returns {Void}  -
     */
    setPropTrafficCountApi: function (value) {
        this.set("propTrafficCountApi", value);
    },

    /**
     * setter for propThingId
     * @param {String} value the thingId of this layer
     * @returns {Void}  -
     */
    setPropThingId: function (value) {
        this.set("propThingId", value);
    },

    /**
     * setter for propMeansOfTransport
     * @param {String} value the meansOfTransport of this layer
     * @returns {Void}  -
     */
    setPropMeansOfTransport: function (value) {
        this.set("propMeansOfTransport", value);
    },

    /**
     * setter for title
     * @param {String} value the title to be shown in the template
     * @returns {Void}  -
     */
    setTitle: function (value) {
        this.set("title", value);
    },

    /**
     * setter for the type
     * @param {String} value the type to be shown in the template
     * @returns {Void}  -
     */
    setType: function (value) {
        this.set("type", value);
    },

    /**
     * setter for meansOfTransport
     * @param {String} value the means of transport to be shown in the template
     * @returns {Void}  -
     */
    setMeansOfTransport: function (value) {
        this.set("meansOfTransport", value);
    },

    /**
     * setter for the description of total
     * @param {String} value the description
     * @returns {Void}  -
     */
    setTotalDesc: function (value) {
        this.set("totalDesc", value);
    },
    /**
     * setter for the value of total
     * @param {String} value the value
     * @returns {Void}  -
     */
    setTotalValue: function (value) {
        this.set("totalValue", value);
    },

    /**
     * setter for the description of thisYearDesc
     * @param {String} value the description
     * @returns {Void}  -
     */
    setThisYearDesc: function (value) {
        this.set("thisYearDesc", value);
    },
    /**
     * setter for the value of thisYearValue
     * @param {String} value the value
     * @returns {Void}  -
     */
    setThisYearValue: function (value) {
        this.set("thisYearValue", value);
    },

    /**
     * setter for the description of lastYearDesc
     * @param {String} value the description
     * @returns {Void}  -
     */
    setLastYearDesc: function (value) {
        this.set("lastYearDesc", value);
    },
    /**
     * setter for the value of lastYearValue
     * @param {String} value the value
     * @returns {Void}  -
     */
    setLastYearValue: function (value) {
        this.set("lastYearValue", value);
    },

    /**
     * setter for the description of lastDayDesc
     * @param {String} value the description
     * @returns {Void}  -
     */
    setLastDayDesc: function (value) {
        this.set("lastDayDesc", value);
    },
    /**
     * setter for the value of lastDayValue
     * @param {String} value the value
     * @returns {Void}  -
     */
    setLastDayValue: function (value) {
        this.set("lastDayValue", value);
    },

    /**
     * setter for the description of highestWorkloadDayDesc
     * @param {String} value the description
     * @returns {Void}  -
     */
    setHighestWorkloadDayDesc: function (value) {
        this.set("highestWorkloadDayDesc", value);
    },
    /**
     * setter for the value of highestWorkloadDayValue
     * @param {String} value the value
     * @returns {Void}  -
     */
    setHighestWorkloadDayValue: function (value) {
        this.set("highestWorkloadDayValue", value);
    },

    /**
     * setter for the description of highestWorkloadWeekDesc
     * @param {String} value the description
     * @returns {Void}  -
     */
    setHighestWorkloadWeekDesc: function (value) {
        this.set("highestWorkloadWeekDesc", value);
    },
    /**
     * setter for the value of highestWorkloadWeekValue
     * @param {String} value the value
     * @returns {Void}  -
     */
    setHighestWorkloadWeekValue: function (value) {
        this.set("highestWorkloadWeekValue", value);
    },

    /**
     * setter for the description of highestWorkloadMonthDesc
     * @param {String} value the description
     * @returns {Void}  -
     */
    setHighestWorkloadMonthDesc: function (value) {
        this.set("highestWorkloadMonthDesc", value);
    },
    /**
     * setter for the value of highestWorkloadMonthValue
     * @param {String} value the value
     * @returns {Void}  -
     */
    setHighestWorkloadMonthValue: function (value) {
        this.set("highestWorkloadMonthValue", value);
    },

    /**
     * setter for lastUpdate
     * @param {String} value the datetime of the last update to be shown in the template
     * @returns {Void}  -
     */
    setLastUpdate: function (value) {
        this.set("lastUpdate", value);
    }
});

export default TrafficCountModel;
