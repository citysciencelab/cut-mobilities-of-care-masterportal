import Theme from "../model";
import {TrafficCountApi} from "./trafficCountApi";
import moment from "moment";
import SnippetDatepickerModel from "../../../../snippets/datepicker/model";

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
        api.subscribeLastUpdate(thingId, meansOfTransport, datetime => {
            this.setLastUpdate(moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY, HH:mm:ss"));
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
            this.setHighestWorkloadWeekDesc(!isNaN(calendarWeek) || typeof calendarWeek === "string" ? "KW " + calendarWeek : "");
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

        this.addDayDatepicker(this.get("dayDatepicker"));
        api.updateDataset(thingId, meansOfTransport, interval, from, until, (dataset) => {
            if (!dataset.hasOwnProperty(meansOfTransport)) {
                return;
            }

            this.refreshDiagramDay(dataset[meansOfTransport]);

            // @todo: setup table with dataset
        });
    },

    /**
     * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
     * @param {object} datepicker datepicker model
     * @returns {void}
     */
    addDayDatepicker: function (datepicker) {
        if (!datepicker) {
            this.set("dayDatepicker", new SnippetDatepickerModel({
                displayName: "Tag",
                preselectedValue: moment().toDate(),
                startDate: moment().subtract(7, "days").toDate(),
                endDate: moment().toDate(),
                type: "datepicker",
                autoclose: true,
                inputs: $("#dayDateInput"),
                todayHighlight: false
            }));
            this.listenTo(this.get("dayDatepicker"), {
                "valuesChanged": function () {
                    // do nothing
                }
            });
            this.trigger("renderDayDatepicker");
        }
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

        this.addWeekDatepicker(this.get("weekDatepicker"));
        api.updateDataset(thingId, meansOfTransport, interval, from, until, (dataset) => {
            if (!dataset.hasOwnProperty(meansOfTransport)) {
                return;
            }

            this.refreshDiagramWeek(dataset[meansOfTransport]);

            // @todo: setup table with dataset
        });
    },

    /**
     * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
     * @param {object} datepicker datepicker model
     * @returns {void}
     */
    addWeekDatepicker: function (datepicker) {
        if (!datepicker) {
            this.set("weekDatepicker", new SnippetDatepickerModel({
                preselectedValue: moment().toDate(),
                startDate: moment().subtract(1, "month").toDate(),
                endDate: moment().toDate(),
                type: "datepicker",
                selectWeek: true,
                inputs: $("#weekDateInput"),
                calendarWeeks: true,
                autoclose: true,
                format: {
                    toDisplay: function (date) {
                        return moment(date).startOf("isoWeek").format("DD.MM.YYYY") + "-" + moment(date).endOf("isoWeek").format("DD.MM.YYYY");
                    },
                    toValue: function (date) {
                        return moment.utc(date).startOf("isoWeek").toDate();
                    }
                },
                todayHighlight: false
            }));
            this.listenTo(this.get("weekDatepicker"), {
                "valuesChanged": function () {
                    // do nothing
                }
            });
            this.trigger("renderWeekDatepicker");
        }
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

        this.addYearDatepicker(this.get("yearDatepicker"));
        api.updateDataset(thingId, meansOfTransport, interval, from, until, (dataset) => {
            if (!dataset.hasOwnProperty(meansOfTransport)) {
                return;
            }

            const year = moment(from, "YYYY-MM-DD").format("YYYY");

            this.refreshDiagramYear(dataset[meansOfTransport], year);

            // @todo: setup table with dataset
        });
    },

    /*
     * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
     * @param {object} datepicker datepicker model
     * @returns {void}
     */
    addYearDatepicker: function (datepicker) {
        if (!datepicker) {
            this.set("yearDatepicker", new SnippetDatepickerModel({
                displayName: "Tag",
                preselectedValue: moment().toDate(),
                startDate: moment().subtract(10, "years").toDate(),
                endDate: moment().toDate(),
                type: "datepicker",
                minViewMode: "years",
                maxViewMode: "years",
                inputs: $("#yearDateInput"),
                autoclose: true,
                format: "yyyy"
            }));
            this.listenTo(this.get("yearDatepicker"), {
                "valuesChanged": function () {
                    // do nothing
                }
            });
            this.trigger("renderYearDatepicker");
        }
    },

    /**
     * refreshes the diagram for a dataset based on day
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @returns {Void}  -
     */
    refreshDiagramDay: function (dataset) {
        const themeId = this.get("themeId"),
            selector = ".trafficCountDiagramDay_" + themeId,
            selectorTooltip = ".graph-tooltip-div-day_" + themeId,
            xAxisTickValues = this.getXAxisTickValuesDay(),
            emptyDiagramData = this.getEmptyDiagramDataDay();

        this.refreshDiagramGeneral(dataset, selector, selectorTooltip, "hour", {
            unit: " Uhr",
            values: xAxisTickValues
        }, "count", "", "Anzahl / 15 Min.", datetime => {
            return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY");
        }, datetime => {
            return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("HH:mm");
        }, (value, dotData) => {
            return dotData.hour + " Uhr: " + this.addThousandPoints(value);
        }, emptyDiagramData);
    },

    /**
     * refreshes the diagram for a dataset based on week
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @returns {Void}  -
     */
    refreshDiagramWeek: function (dataset) {
        const themeId = this.get("themeId"),
            selector = ".trafficCountDiagramWeek_" + themeId,
            selectorTooltip = ".graph-tooltip-div-week_" + themeId,
            xAxisTickValues = this.getXAxisTickValuesWeek(),
            emptyDiagramData = this.getEmptyDiagramDataWeek();

        this.refreshDiagramGeneral(dataset, selector, selectorTooltip, "weekday", {
            unit: "",
            values: xAxisTickValues
        }, "count", "", "Anzahl / h", datetime => {
            const weeknumber = moment(datetime, "YYYY-MM-DD HH:mm:ss").week(),
                year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");

            return "KW " + weeknumber + " / " + year;
        }, datetime => {
            const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss");

            if (objMoment.format("H") === "0") {
                return objMoment.format("dd");
            }

            return objMoment.format("dd-HH");
        }, (value, dotData) => {
            const objMoment = moment(dotData.date, "YYYY-MM-DD HH:mm:ss");

            return objMoment.format("DD.MM.YYYY") + ", " + objMoment.format("HH:mm") + " Uhr: " + this.addThousandPoints(value);
        }, emptyDiagramData);
    },

    /**
     * refreshes the diagram for a dataset based on year
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @param {String} year the year from the calendar as String
     * @returns {Void}  -
     */
    refreshDiagramYear: function (dataset, year) {
        const themeId = this.get("themeId"),
            selector = ".trafficCountDiagramYear_" + themeId,
            selectorTooltip = ".graph-tooltip-div-year_" + themeId,
            xAxisTickValues = this.getXAxisTickValuesYear(),
            emptyDiagramData = this.getEmptyDiagramDataYear(year);

        this.refreshDiagramGeneral(dataset, selector, selectorTooltip, "month", {
            unit: "",
            values: xAxisTickValues
        }, "count", "", "Anzahl / Woche", datetime => {
            return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");
        }, datetime => {
            const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss"),
                thisWeeksMonth = objMoment.format("MMM"),
                thisWeek = objMoment.format("WW"),
                lastWeeksMonth = objMoment.subtract(1, "week").format("MMM");

            if (thisWeeksMonth !== lastWeeksMonth) {
                return thisWeeksMonth;
            }

            return thisWeeksMonth + "-" + thisWeek;
        }, (value, dotData) => {
            const objMoment = moment(dotData.date, "YYYY-MM-DD HH:mm:ss");

            return "KW " + objMoment.format("WW") + " / " + objMoment.format("YYYY") + ": " + this.addThousandPoints(value);
        }, emptyDiagramData);
    },

    /**
     * refreshes the diagram with the given data
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @param {String} selector the dom selector of the diagram (e.g. an id as "#...")
     * @param {String} selectorTooltip the dom selector for the tooltip of the diagram (e.g. a class as ".(...)")
     * @param {String} xAttr the attribute to use for x axis values (e.g. week, weekday, hour)
     * @param {Object} xAxisTicks an object to define the behavior of the xAxis as object{unit, values}
     * @param {String} yAttr the attribute to use for y axis values (e.g. value1234, number5222) - must be unique for this line as it is used as attrName in attrToShowArray as well
     * @param {String} xAxisText the text of the x axis
     * @param {String} yAxisText the text of the y axis
     * @param {Callback} callbackRenderLegendText a function (phenomenonTime) to write the legend text with
     * @param {Callback} callbackRenderTextXAxis a function (phenomenonTime) to write the entry at the x axis with
     * @param {Callback} setTooltipValue a function value:=function(value, xAxisAttr) to set/convert the tooltip value that is shown hovering a point - if not set or left undefined: default is >(...).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")< due to historic reasons
     * @param {Object} emptyDiagramData empty diagram dataset to be filled by dataset as object{xAxisValue: {class, style, xAxisAttr}}
     * @returns {Void}  -
     */
    refreshDiagramGeneral: function (dataset, selector, selectorTooltip, xAttr, xAxisTicks, yAttr, xAxisText, yAxisText, callbackRenderLegendText, callbackRenderTextXAxis, setTooltipValue, emptyDiagramData) { // eslint-disable-line
        const legendData = [],
            attrToShowArray = [],
            diagramWidth = parseInt($(".trafficCount").css("width"), 10) - 10,
            diagramHeight = 280;
        let graphConfig = null,
            diagramData = [];

        if (typeof dataset !== "object") {
            return;
        }

        this.addD3LegendData("dot", "circle", callbackRenderLegendText(Object.keys(dataset)[0]), legendData);
        this.addD3AttrToShowArray(yAttr, "line", attrToShowArray);
        diagramData = this.addD3LineData("dot", "circle", xAttr, yAttr, callbackRenderTextXAxis, dataset, emptyDiagramData);

        graphConfig = this.createD3Config(legendData, selector, selectorTooltip, diagramWidth, diagramHeight, xAttr, xAxisTicks, {
            label: xAxisText,
            translate: 6
        }, {
            label: yAxisText,
            offset: 54
        }, attrToShowArray, setTooltipValue, diagramData);

        // In case multi GFI themes come together, we need to clear the bar graph so that only one bar graph shows up
        $(selector + " svg").remove();

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * adds data to be used as legend data for the diagram to the given result set
     * @param {String} classname the name of the class to use for the dots of this legend entry
     * @param {String} stylename the name of the style to use for the dots of this legend entry (e.g. circle)
     * @param {String} text the text to use for the legend
     * @param {Object[]} result the result by reference to add the new legend data to: the result is an array of objects{class, style, text} that can be used as legend data for the D3 diagram
     * @returns {Void}  -
     */
    addD3LegendData: function (classname, stylename, text, result) {
        if (!Array.isArray(result)) {
            return;
        }

        result.push({
            class: classname,
            style: stylename,
            text: text
        });
    },

    /**
     * adds an object{attrName, attrClass} to the given result
     * @param {String} yAttr the name of the attribute equal to yAttr in addD3LineData
     * @param {String} classname the name of the class to use for the line with the given yAttr
     * @param {Object[]} result the result by reference to add the new data to: result is an array of objects{attrName, attrClass} to be used as "attrToShowArray"
     * @returns {Void}  -
     */
    addD3AttrToShowArray: function (yAttr, classname, result) {
        if (!Array.isArray(result)) {
            return;
        }

        result.push({
            attrName: yAttr,
            attrClass: classname
        });
    },

    /**
     * adds objects to use as diagram data to the given result set
     * @param {String} classname the name of the class to use for the dots of this line
     * @param {String} stylename the name of the style to use for the dots of this line (e.g. circle)
     * @param {String} xAttr the attribute to use for x axis values (e.g. week, weekday, hour)
     * @param {String} yAttr the attribute to use for y axis values (e.g. value1234, number5222) - must be unique for this line as it is used as attrName in attrToShowArray as well
     * @param {Callback} callbackRenderTextXAxis a function (phenomenonTime) to convert the key of dataset into the wanted format with
     * @param {Object[]} dataset the dataset from the API as array of objects{phenomenonTime: value}
     * @param {Object} emptyDiagramData empty diagram dataset to be filled by dataset as object{xAxisValue: {class, style, xAxisAttr}}
     * @returns {Object[]}  the result by reference to add the new data to: the result is an array of objects{class, style, (xAttr), (yAttr)} that can be used as dataset for the D3 diagram
     */
    addD3LineData: function (classname, stylename, xAttr, yAttr, callbackRenderTextXAxis, dataset, emptyDiagramData) {
        if (typeof dataset !== "object" || typeof emptyDiagramData !== "object" || typeof callbackRenderTextXAxis !== "function") {
            return [];
        }

        let key;

        for (key in dataset) {
            const obj = {
                class: classname,
                style: stylename,
                date: key
            };

            obj[xAttr] = callbackRenderTextXAxis(key);
            obj[yAttr] = dataset[key];

            emptyDiagramData[obj[xAttr]] = obj;
        }

        return Object.values(emptyDiagramData);
    },

    /**
     * returns an array of xAxis Attributes to be shown in the diagram
     * @return {String[]}  an array with relevant xAxis Attributes for the day diagram
     */
    getXAxisTickValuesDay: function () {
        return ["00:00", "06:00", "12:00", "18:00", "23:00"];
    },

    /**
     * returns an array of xAxis Attributes to be shown in the diagram
     * @return {String[]}  an array with relevant xAxis Attributes for the week diagram
     */
    getXAxisTickValuesWeek: function () {
        const xAxisTickValues = [];
        let wd = 0;

        for (wd = 1; wd <= 7; wd++) {
            xAxisTickValues.push(moment(wd % 7, "d").format("dd"));
        }

        return xAxisTickValues;
    },

    /**
     * returns an array of xAxis Attributes to be shown in the diagram
     * @return {String[]}  an array with relevant xAxis Attributes for the year diagram
     */
    getXAxisTickValuesYear: function () {
        const xAxisTickValues = [];
        let m = 0;

        for (m = 1; m <= 12; m++) {
            xAxisTickValues.push(moment(m, "M").format("MMM"));
        }

        return xAxisTickValues;
    },

    /**
     * generates an empty dataset of diagram data to be used as pattern for the diagramData
     * @info this is necessary to expand the year, week or day diagram to full span
     * @return {Object}  an empty dataset for the day as object{xAttr: {class, style, hour}}
     */
    getEmptyDiagramDataDay: function () {
        const result = {};
        let key,
            h,
            m;

        for (h = 0; h < 24; h++) {
            for (m = 0; m < 4; m++) {
                key = moment(h + ":" + (m * 15), "H:m").format("HH:mm");

                result[key] = {
                    hour: key
                };
            }
        }

        return result;
    },

    /**
     * generates an empty dataset of diagram data to be used as pattern for the diagramData
     * @info this is necessary to expand the year, week or day diagram to full span
     * @return {Object}  an empty dataset for the week as object{xAttr: {class, style, hour}}
     */
    getEmptyDiagramDataWeek: function () {
        const result = {};
        let key,
            wd,
            h;

        for (wd = 1; wd <= 7; wd++) {
            for (h = 0; h < 24; h++) {
                if (h === 0) {
                    key = moment(wd % 7, "d").format("dd");
                }
                else {
                    key = moment((wd % 7) + "-" + h, "d-H").format("dd-HH");
                }

                result[key] = {
                    weekday: key
                };
            }
        }

        return result;
    },

    /**
     * generates an empty dataset of diagram data to be used as pattern for the diagramData
     * @param {String} year the year to use in format YYYY
     * @info this is necessary to expand the year, week or day diagram to full span
     * @return {Object}  an empty dataset for the year as object{xAttr: {class, style, hour}}
     */
    getEmptyDiagramDataYear: function (year) {
        const result = {},
            // set moment to 01.01.(year) 00:00:00
            objMoment = moment(year, "YYYY");
        let key,
            lastMonth = "";

        while (objMoment.format("YYYY") === year) {
            if (lastMonth !== objMoment.format("MMM")) {
                lastMonth = objMoment.format("MMM");
                key = lastMonth;
            }
            else {
                key = objMoment.format("MMM-WW");
            }

            result[key] = {
                month: key
            };

            objMoment.add(1, "week");
        }

        return result;
    },

    /**
     * generates a new config, usable for the Radio trigger "Graph"=>"createGraph"
     * @param {Object[]} legendData an array of objects{class, style, text} to use as legend for the diagram
     * @param {String} selector the dom selector of the diagram (e.g. an id as "#...")
     * @param {String} selectorTooltip the dom selector for the tooltip of the diagram (e.g. a class as ".(...)")
     * @param {Integer} width the width of the diagram
     * @param {Integer} height the height of the diagram
     * @param {String} xAttr the attribute to use from the dataset to bind the data to the math. x axis
     * @param {Object} xAxisTicks an object to define the behavior of the xAxis as object{unit, values}
     * @param {Object} xAxisLabel an object {label, translate} with the label to use for the math. x axis
     * @param {Object} yAxisLabel an object {label, offset} with the label to use for the math. y axis
     * @param {Object[]} attrToShowArray the classes of lines as array of object{attrName, attrClass}
     * @param {callback} setTooltipValue a function(value) to be called at the event of a tooltip
     * @param {Object[]} dataset an array of objects as Array({(xAttr), (yAttr), class, style})
     * @return {Object}  a config object to be used for d3
     */
    createD3Config: function (legendData, selector, selectorTooltip, width, height, xAttr, xAxisTicks, xAxisLabel, yAxisLabel, attrToShowArray, setTooltipValue, dataset) { // eslint-disable-line
        const graphConfig = {
            legendData: legendData,
            graphType: "Linegraph",
            selector: selector,
            width: width,
            height: height,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 60
            },
            svgClass: "graph-svg",
            selectorTooltip: selectorTooltip,
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            xAxisTicks: xAxisTicks,
            dotSize: 2,
            yAxisTicks: {
                ticks: 5,
                factor: ",f"
            },
            data: dataset,
            xAttr: xAttr,
            xAxisLabel: xAxisLabel,
            yAxisLabel: yAxisLabel,
            attrToShowArray: attrToShowArray,
            setTooltipValue: setTooltipValue
        };

        return graphConfig;
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
