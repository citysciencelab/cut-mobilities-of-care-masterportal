import Theme from "../model";
import {TrafficCountCache} from "./trafficCountCache";
import moment from "moment";
import SnippetDatepickerModel from "../../../../snippets/datepicker/model";
import ChartJs from "chart.js";
import ExportButtonModel from "../../../../snippets/exportButton/model";

const TrafficCountModel = Theme.extend(/** @lends TrafficCountModel.prototype*/{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        currentLng: "",
        infoLabel: "",
        dayLabel: "",
        weekLabel: "",
        yearLabel: "",
        period: "",
        number: "",
        totalSince: "",
        sinceBeginningOfTheYear: "",
        overThePastYear: "",
        onThePreviousDay: "",
        highestDay: "",
        highestWeek: "",
        highestMonth: "",
        dateLabel: "",
        clockLabel: "",
        tableLabel: "",
        notice: "",
        lastupdateLabel: "",
        diagramLabel: "",
        calendarweek: "",
        infraredsensor: "",
        countingstation: "",
        carLabel: "",
        bicycleLabel: "",

        dayTableContent: [],
        weekTableContent: [],
        yearTableContent: [],

        carsHeaderSuffix: "",
        trucksHeaderSuffix: "",

        idLabel: "",
        typeLabel: "",
        meansOfTransportLabel: "",

        meansOfTransportFahrzeuge: "AnzFahrzeuge",
        meansOfTransportFahrraeder: "Anzahl_Fahrraeder",
        meansOfTransportSV: "AntSV",

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
            AnzFahrzeuge: "",
            Anzahl_Fahrraeder: ""
        },
        meansOfTransportAssoc: {
            AnzFahrzeuge: "",
            Anzahl_Fahrraeder: ""
        },
        dayInterval: "15-Min",
        weekInterval: "1-Tag",
        yearInterval: "1-Woche",
        dayDatepicker: null,
        weekDatepicker: null,
        yearDatepicker: null,
        tabValue: "infos"
    }),


    /**
     * @class TrafficCountModel
     * @description This theme is used to show trafficCount data for Radzählstationen, Radzählsäulen and aVME data
     * @memberof Tools.GFI.Themes.TrafficCount
     * @listens GFI#RadioTriggerGFISetIsVisible
     * @fires   Alerting#RadioTriggerAlertAlert
     * @constructs
     * @property {Object} feature feature to show gfi.
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang(i18next.language);

        this.set("exportButtonModel", new ExportButtonModel({
            tag: "Download",
            rawData: [],
            fileExtension: "csv"
        }));

        this.listenTo(this, {
            "change:isVisible": this.onIsVisibleEvent
        });
        this.listenTo(Radio.channel("GFI"), {
            "isVisible": this.onGFIIsVisibleEvent
        }, this);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            currentLng: lng,
            infoLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.infoLabel"),
            dayLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.dayLabel"),
            weekLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.weekLabel"),
            yearLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.yearLabel"),
            period: i18next.t("common:modules.tools.gfi.themes.trafficCount.period"),
            number: i18next.t("common:modules.tools.gfi.themes.trafficCount.number"),
            totalSince: i18next.t("common:modules.tools.gfi.themes.trafficCount.totalSince"),
            sinceBeginningOfTheYear: i18next.t("common:modules.tools.gfi.themes.trafficCount.sinceBeginningOfTheYear"),
            overThePastYear: i18next.t("common:modules.tools.gfi.themes.trafficCount.overThePastYear"),
            onThePreviousDay: i18next.t("common:modules.tools.gfi.themes.trafficCount.onThePreviousDay"),
            highestDay: i18next.t("common:modules.tools.gfi.themes.trafficCount.highestDay"),
            highestWeek: i18next.t("common:modules.tools.gfi.themes.trafficCount.highestWeek"),
            highestMonth: i18next.t("common:modules.tools.gfi.themes.trafficCount.highestMonth"),
            dateLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.dateLabel"),
            clockLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.clockLabel"),
            tableLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.tableLabel"),
            notice: i18next.t("common:modules.tools.gfi.themes.trafficCount.notice"),
            lastupdateLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.lastupdateLabel"),
            diagramLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.diagramLabel"),
            calendarweek: i18next.t("common:modules.tools.gfi.themes.trafficCount.calendarweek"),
            meansOfTransportAssoc: {
                AnzFahrzeuge: i18next.t("common:modules.tools.gfi.themes.trafficCount.carLabel"),
                Anzahl_Fahrraeder: i18next.t("common:modules.tools.gfi.themes.trafficCount.bicycleLabel")
            },
            typeAssoc: {
                AnzFahrzeuge: i18next.t("common:modules.tools.gfi.themes.trafficCount.infraredsensor"),
                Anzahl_Fahrraeder: i18next.t("common:modules.tools.gfi.themes.trafficCount.countingstation")
            },
            idLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.idLabel"),
            typeLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.typeLabel"),
            meansOfTransportLabel: i18next.t("common:modules.tools.gfi.themes.trafficCount.meansOfTransportLabel"),
            carsHeaderSuffix: i18next.t("common:modules.tools.gfi.themes.trafficCount.carsHeaderSuffix"),
            trucksHeaderSuffix: i18next.t("common:modules.tools.gfi.themes.trafficCount.trucksHeaderSuffix"),
            yAxisTextDay: i18next.t("common:modules.tools.gfi.themes.trafficCount.yAxisTextDay"),
            yAxisTextWeek: i18next.t("common:modules.tools.gfi.themes.trafficCount.yAxisTextWeek"),
            yAxisTextYear: i18next.t("common:modules.tools.gfi.themes.trafficCount.yAxisTextYear")
        });
        moment.locale(lng);
    },

    /**
     * Fired when GFI visibility changes
     * @param   {boolean} visible gfi visibility
     * @returns {void}
     */
    onGFIIsVisibleEvent: function (visible) {
        const api = this.get("propTrafficCountApi");

        if (visible === false) {
            if (api !== null) {
                api.unsubscribeEverything();
            }
            this.stopListening(Radio.channel("GFI"), "isVisible");
            this.clear({silent: true});
            this.unbind();
        }
    },

    /**
     * Toggles the visibility of this GFI according to its visibitily.
     * @param   {object}  gfi       gfi object
     * @param   {Boolean} isVisible is gfi visible
     * @returns {void}
     */
    onIsVisibleEvent: function (gfi, isVisible) {
        const api = this.get("propTrafficCountApi");

        // make sure to check on 'isVisible' and 'isCreated' to avoid problems mith multiple trafficCount in one opened gfi
        if (!isVisible && this.get("isCreated") === true) {
            this.set("isCreated", false);
            api.unsubscribeEverything();
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
                mqttUrl: "wss://" + feature.get("requestUrl").split("/")[2] + "/mqtt",
                mqttVersion: "3.1.1",
                rhPath: url,
                context: this
            };

        this.setPropTrafficCountApi(new TrafficCountCache(url, sensorThingsApiVersion, mqttOptions));
        this.setPropThingId(thingId);
        this.setPropMeansOfTransport(meansOfTransport);

        // init the tab for infos
        this.toggleTab(this.get("tabValue"));
    },

    /**
     * to be called on toggle of a tab
     * @param {String} tabValue the value of the target element (info, day, week, year)
     * @fires   Alerting#RadioTriggerAlertAlert
     * @returns {Void}  -
     */
    toggleTab: function (tabValue) {
        const api = this.get("propTrafficCountApi"),
            thingId = this.get("propThingId"),
            meansOfTransport = this.get("propMeansOfTransport");

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
            this.setupTabDay();
            this.downloadDataDay(thingId, meansOfTransport, result => {
                this.get("exportButtonModel").set("rawData", this.prepareDataForDownload(result.data[meansOfTransport], tabValue));
                this.get("exportButtonModel").set("filename", result.title.replace(" ", "_") + "-15min_Werte");
                // onerror
            }, error => {
                console.warn("error", "downloadDataDay", error);
                Radio.trigger("Alert", "alert", {
                    content: "Die Daten können im Moment nicht heruntergeladen werden",
                    category: "Info"
                });
                this.get("exportButtonModel").set("disabled", true);
            }, () => {
                // onstart
                this.get("exportButtonModel").set("disabled", true);
            }, () => {
                // oncomplete
                this.get("exportButtonModel").set("disabled", false);
            });
        }
        else if (tabValue === "week") {
            this.setupTabWeek();
            this.downloadDataWeek(thingId, meansOfTransport, result => {
                this.get("exportButtonModel").set("rawData", this.prepareDataForDownload(result.data[meansOfTransport], tabValue));
                this.get("exportButtonModel").set("filename", result.title.replace(" ", "_") + "-Tageswerte");
                // onerror
            }, error => {
                console.warn("error", "downloadDataWeek", error);
                Radio.trigger("Alert", "alert", {
                    content: "Die Daten können im Moment nicht heruntergeladen werden",
                    category: "Info"
                });
                this.get("exportButtonModel").set("disabled", true);
            }, () => {
                // onstart
                this.get("exportButtonModel").set("disabled", true);
            }, () => {
                // oncomplete
                this.get("exportButtonModel").set("disabled", false);
            });
        }
        else if (tabValue === "year") {
            this.setupTabYear();
            this.downloadDataYear(thingId, meansOfTransport, result => {
                this.get("exportButtonModel").set("rawData", this.prepareDataForDownload(result.data[meansOfTransport], tabValue));
                this.get("exportButtonModel").set("filename", result.title.replace(" ", "_") + "-Wochenwerte");
                // onerror
            }, error => {
                console.warn("error", "downloadDataYear", error);
                Radio.trigger("Alert", "alert", {
                    content: "Die Daten können im Moment nicht heruntergeladen werden",
                    category: "Info"
                });
                this.get("exportButtonModel").set("disabled", true);
            }, () => {
                // onstart
                this.get("exportButtonModel").set("disabled", true);
            }, () => {
                // oncomplete
                this.get("exportButtonModel").set("disabled", false);
            });
        }
        else {
            this.setupTabInfo(api, thingId, meansOfTransport);
        }

        // tab footer
        api.subscribeLastUpdate(thingId, meansOfTransport, datetime => {
            this.setLastUpdate(moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY, HH:mm:ss"));
        }, errormsg => {
            this.setLastUpdate("(aktuell keine Zeitangabe)");
            console.warn("The last update received is incomplete:", errormsg);
            Radio.trigger("Alert", "alert", {
                content: "Das vom Sensor-Server erhaltene Datum der letzten Aktualisierung kann wegen eines API-Fehlers nicht ausgegeben werden.",
                category: "Info"
            });
        });
    },

    /**
     * converts the data object into an array of objects for the csv download
     * @param {Object} data - the data for download
     * @param {String} tabValue - day | week | year
     * @returns {Object[]} objArr - converted data
     */
    prepareDataForDownload: function (data, tabValue) {
        const objArr = [];

        for (const key in data) {
            const obj = {},
                date = key.split(" ");

            if (tabValue === "day") {
                obj.Datum = date[0];
                obj["Uhrzeit von"] = date[1].slice(0, -3);
            }
            else if (tabValue === "week") {
                obj.Datum = date[0];
            }
            else if (tabValue === "year") {
                obj["Kalenderwoche ab"] = date[0];
            }
            obj.Anzahl = data[key];
            objArr.push(obj);
        }

        return objArr;
    },
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
            this.setTotalValue(this.addThousandPoints(value));
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
            this.setThisYearValue(this.addThousandPoints(value));
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
            this.setLastYearValue(this.addThousandPoints(value));
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
            this.setLastDayValue(this.addThousandPoints(value));
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
            this.setHighestWorkloadDayValue(this.addThousandPoints(value));
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
            this.setHighestWorkloadWeekDesc(!isNaN(calendarWeek) || typeof calendarWeek === "string" ? this.get("calendarweek") + " " + calendarWeek : "");
            this.setHighestWorkloadWeekValue(this.addThousandPoints(value));
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
            this.setHighestWorkloadMonthValue(this.addThousandPoints(value));
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
     * creates a json for the dayLine data
     * @param {Array} datasets contain the dayLine data
     * @return {Object} Object with prepared data
     */
    prepareDatasetHourly: function (datasets) {
        const retObjArr = [];
        let bicyclesResultVal = "",
            carsResultVal = "",
            trucksResultVal = "";

        datasets.forEach(dataset => {
            const retObj = {};

            retObj.trucks = [];
            retObj.cars = [];
            retObj.bicycles = [];

            Object.keys(dataset).forEach(meansOfTransport => {
                Object.keys(dataset[meansOfTransport]).forEach(datetime => {

                    const splittedDate = datetime.split(" "),
                        date = moment(splittedDate[0], "YYYY-MM-DD").format("YYYY-MM-DD"),
                        hour = moment(splittedDate[1], "HH:mm:ss").format("HH:mm");

                    if (meansOfTransport === this.get("meansOfTransportFahrraeder")) {
                        if (dataset[meansOfTransport][datetime] !== undefined && dataset[meansOfTransport][datetime] !== "" && dataset[meansOfTransport][datetime] !== null) {
                            bicyclesResultVal = this.addThousandPoints(dataset[meansOfTransport][datetime]);
                        }

                        retObj.bicycles.push({
                            date: date,
                            hour: hour,
                            result: bicyclesResultVal
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportFahrzeuge")) {
                        if (dataset[meansOfTransport][datetime] !== undefined && dataset[meansOfTransport][datetime] !== "" && dataset[meansOfTransport][datetime] !== null) {
                            carsResultVal = this.addThousandPoints(dataset[meansOfTransport][datetime]);
                        }

                        retObj.cars.push({
                            date: date,
                            hour: hour,
                            result: carsResultVal
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportSV")) {
                        if (dataset[meansOfTransport][datetime] !== undefined && dataset[meansOfTransport][datetime] !== "" && dataset[meansOfTransport][datetime] !== null) {
                            trucksResultVal = dataset[meansOfTransport][datetime];
                        }

                        retObj.trucks.push({
                            date: date,
                            hour: hour,
                            result: trucksResultVal
                        });
                    }
                });
            });

            retObjArr.push(retObj);
        });

        return retObjArr;
    },

    /**
     * creates a json for the yearLine data
     * @param {Array} datasets contain the yearLine data
     * @return {Object} Object with prepared data
     */
    prepareYearDataset: function (datasets) {
        const retObjArr = [];
        let bicyclesResultVal = "",
            carsResultVal = "",
            trucksResultVal = "";

        datasets.forEach(dataset => {
            const retObj = {};

            retObj.trucks = [];
            retObj.cars = [];
            retObj.bicycles = [];

            Object.keys(dataset).forEach(meansOfTransport => {
                Object.keys(dataset[meansOfTransport]).forEach(datetime => {

                    const date = moment(datetime, "YYYY-MM-DD").format("YYYY-MM-DD"),
                        calenderWeek = moment(datetime).add(3, "days").format("WW");

                    if (meansOfTransport === this.get("meansOfTransportFahrraeder")) {
                        if (dataset[meansOfTransport][datetime] !== undefined && dataset[meansOfTransport][datetime] !== "" && dataset[meansOfTransport][datetime] !== null) {
                            bicyclesResultVal = this.addThousandPoints(dataset[meansOfTransport][datetime]);
                        }

                        retObj.bicycles.push({
                            date: date,
                            calenderWeek: calenderWeek,
                            result: bicyclesResultVal
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportFahrzeuge")) {
                        if (dataset[meansOfTransport][datetime] !== undefined && dataset[meansOfTransport][datetime] !== "" && dataset[meansOfTransport][datetime] !== null) {
                            carsResultVal = this.addThousandPoints(dataset[meansOfTransport][datetime]);
                        }

                        retObj.cars.push({
                            date: date,
                            calenderWeek: calenderWeek,
                            result: carsResultVal
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportSV")) {
                        if (dataset[meansOfTransport][datetime] !== undefined && dataset[meansOfTransport][datetime] !== "" && dataset[meansOfTransport][datetime] !== null) {
                            trucksResultVal = dataset[meansOfTransport][datetime];
                        }

                        retObj.trucks.push({
                            date: date,
                            calenderWeek: calenderWeek,
                            result: trucksResultVal
                        });
                    }
                });
            });

            retObjArr.push(retObj);
        });

        return retObjArr;
    },

    /**
     * prepare and set table data for day
     * @param {Array} datasets data list of day, week and year for view
     * @param {String} type of the table
     * @param {String} title of the table
     * @param {Array} timeSettings - the selected dates
     * @param {Object} meansOfTransport -
     * @return {Void} -
     */
    prepareTableContent (datasets, type, title, timeSettings, meansOfTransport) {
        const dayTableContentArr = [],
            weekTableContentArr = [],
            yearTableContentArr = [];

        let i = 0;

        if (["day", "week", "year"].indexOf(type) === -1) {
            return;
        }

        datasets.forEach(dataset => {
            switch (type) {
                case "day":
                    dayTableContentArr[i] = {};
                    dayTableContentArr[i].title = title;
                    dayTableContentArr[i].meansOfTransport = meansOfTransport;
                    dayTableContentArr[i].firstColumn = "";
                    dayTableContentArr[i].carsArr = {};
                    dayTableContentArr[i].trucksArr = {};
                    dayTableContentArr[i].bicyclesArr = {};

                    if (meansOfTransport === this.get("meansOfTransportFahrraeder") && Array.isArray(dataset.bicycles) && dataset.bicycles.length > 0) {
                        dayTableContentArr[i].firstColumn = moment(timeSettings[i].from).format("DD.MM.YYYY");
                        dataset.bicycles.forEach(element => {
                            dayTableContentArr[i].bicyclesArr[element.hour] = element.result;
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportFahrzeuge") && Array.isArray(dataset.cars) && dataset.cars.length > 0) {
                        dayTableContentArr[i].firstColumn = moment(timeSettings[i].from).format("DD.MM.YYYY");
                        dataset.cars.forEach(element => {
                            dayTableContentArr[i].carsArr[element.hour] = element.result;
                        });

                        if (Array.isArray(dataset.trucks) && dataset.trucks.length > 0) {
                            dataset.trucks.forEach(element => {
                                dayTableContentArr[i].trucksArr[element.hour] = Math.round(element.result * 100);
                            });
                        }
                    }

                    i++;
                    break;
                case "week":

                    weekTableContentArr[i] = {};
                    weekTableContentArr[i].title = title;
                    weekTableContentArr[i].meansOfTransport = meansOfTransport;
                    weekTableContentArr[i].firstColumn = "";
                    weekTableContentArr[i].headerDateArr = [];
                    weekTableContentArr[i].carsArr = {};
                    weekTableContentArr[i].trucksArr = {};
                    weekTableContentArr[i].bicyclesArr = {};

                    weekTableContentArr[i].firstColumn = moment(timeSettings[i].from).add(3, "days").format("WW") + "/" +
                        moment(timeSettings[i].from).format("YYYY");

                    weekTableContentArr[i].headerDateArr = this.getDaysRangeInWeek(moment(timeSettings[i].from).startOf("day"), moment(timeSettings[i].until).startOf("day"));

                    if (meansOfTransport === this.get("meansOfTransportFahrraeder") && Array.isArray(dataset.bicycles) && dataset.bicycles.length > 0) {
                        dataset.bicycles.forEach(element => {
                            weekTableContentArr[i].bicyclesArr[moment(element.date).format("DD.MM.YYYY")] = element.result;
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportFahrzeuge") && Array.isArray(dataset.cars) && dataset.cars.length > 0) {
                        dataset.cars.forEach(element => {
                            weekTableContentArr[i].carsArr[moment(element.date).format("DD.MM.YYYY")] = element.result;
                        });

                        if (Array.isArray(dataset.trucks) && dataset.trucks.length > 0) {
                            dataset.trucks.forEach(element => {
                                weekTableContentArr[i].trucksArr[moment(element.date).format("DD.MM.YYYY")] = Math.round(element.result * 100);
                            });
                        }
                    }
                    i++;
                    break;
                case "year":

                    yearTableContentArr[i] = {};
                    yearTableContentArr[i].title = title;
                    yearTableContentArr[i].meansOfTransport = meansOfTransport;
                    yearTableContentArr[i].firstColumn = "";
                    yearTableContentArr[i].carsArr = {};
                    yearTableContentArr[i].trucksArr = {};
                    yearTableContentArr[i].bicyclesArr = {};

                    if (meansOfTransport === this.get("meansOfTransportFahrraeder") && Array.isArray(dataset.bicycles) && dataset.bicycles.length > 0) {
                        yearTableContentArr[i].firstColumn = timeSettings[i].selectedYear;

                        dataset.bicycles.forEach(element => {
                            yearTableContentArr[i].bicyclesArr[element.calenderWeek] = element.result;
                        });
                    }

                    if (meansOfTransport === this.get("meansOfTransportFahrzeuge") && Array.isArray(dataset.cars) && dataset.cars.length > 0) {
                        yearTableContentArr[i].firstColumn = timeSettings[i].selectedYear;

                        dataset.cars.forEach(element => {
                            yearTableContentArr[i].carsArr[element.calenderWeek] = element.result;
                        });

                        if (Array.isArray(dataset.trucks) && dataset.trucks.length > 0) {
                            dataset.trucks.forEach(element => {
                                yearTableContentArr[i].trucksArr[element.calenderWeek] = Math.round(element.result * 100);
                            });
                        }
                    }

                    i++;
                    break;
                default:
            }
        });

        if (type === "day") {
            this.setDayTableContent(dayTableContentArr);
        }
        else if (type === "week") {
            this.setWeekTableContent(weekTableContentArr);
        }
        else {
            this.setYearTableContent(yearTableContentArr);
        }
    },

    /**
     * returns the days between
     * @param {Object} from - from date
     * @param {Object} until - to date
     * @return {Array} - returns the days range in a week
     */
    getDaysRangeInWeek: function (from, until) {
        const dates = [];

        dates.push(from.clone().format("DD.MM.YYYY"));
        while (from.add(1, "days").diff(until) <= 0) {
            dates.push(from.clone().format("DD.MM.YYYY"));
        }

        return dates;
    },

    /**
     * Setup of the info tab.
     * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
     * @listens Snippets#ValuesChanged
     * @returns {Void}  -
     */
    setupTabDay: function () {
        const datepicker = this.get("dayDatepicker"),
            startDate = moment().subtract(7, "days");

        if (!datepicker) {
            this.set("dayDatepicker", new SnippetDatepickerModel({
                displayName: "Tag",
                multidate: 5,
                preselectedValue: moment().toDate(),
                startDate: startDate.toDate(),
                endDate: moment().toDate(),
                type: "datepicker",
                inputs: $("#dayDateInput"),
                todayHighlight: false,
                language: this.get("currentLng")
            }));
            this.listenTo(this.get("dayDatepicker"), {
                "valuesChanged": this.dayDatepickerValueChanged
            });
            this.trigger("renderDayDatepicker");
            this.get("dayDatepicker").updateValues(moment().toDate());
        }
        else {
            this.trigger("renderDayDatepicker");
        }
    },

    /**
     * Function is initially triggered and on update
     * @param   {Backbone.Model} model DatePickerValue Model
     * @param   {Date} dates an unsorted array of selected dates of weekday
     * @fires   Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    dayDatepickerValueChanged: function (model, dates) {
        const api = this.get("propTrafficCountApi"),
            thingId = this.get("propThingId"),
            meansOfTransport = this.get("propMeansOfTransport"),
            timeSettings = [],
            themeId = this.get("themeId"),
            selector = "trafficCountDiagramDay_" + themeId;

        if (dates.length === 0) {
            this.removeCanvas(selector);
            this.setDayTableContent([]);
        }
        else {
            dates.sort((earlyDate, lateDate) => {
                // Showing earlier date first
                return earlyDate - lateDate;
            }).forEach(date => {
                const fromDate = moment(date).format("YYYY-MM-DD");

                timeSettings.push({
                    interval: this.get("dayInterval"),
                    from: fromDate,
                    until: fromDate
                });
            });

            api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {

                this.refreshDiagramDay(datasets, meansOfTransport, selector);
                this.prepareTableContent(this.prepareDatasetHourly(datasets), "day", this.get("dateLabel"), timeSettings, meansOfTransport);

            }, errormsg => {
                this.refreshDiagramDay([]);
                this.setDayTableContent([]);

                console.warn("The data received from api are incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Die gewünschten Daten wurden wegen eines API-Fehlers nicht korrekt empfangen.",
                    category: "Info"
                });
            });
        }
    },

    /**
     * Setup of the week tab.
     * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
     * @listens Snippets#ValuesChanged
     * @returns {Void}  -
     */
    setupTabWeek: function () {
        const datepicker = this.get("weekDatepicker"),
            startDate = moment("2020-01-01") > moment().subtract(1, "year") ? moment("2020-01-01") : moment().subtract(1, "year");

        // create datepicker only on first enter of tab
        if (!datepicker) {
            this.set("weekDatepicker", new SnippetDatepickerModel({
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
                language: this.get("currentLng")
            }));
            this.listenTo(this.get("weekDatepicker"), {
                "valuesChanged": this.weekDatepickerValueChanged
            });
            this.trigger("renderWeekDatepicker");
            this.get("weekDatepicker").updateValues(moment().toDate());
        }
        else {
            this.trigger("renderWeekDatepicker");
        }
    },

    /**
     * Function is initially triggered and on update
     * @param   {Backbone.Model} model DatePickerValue Model
     * @param   {Date} dates an unsorted array of selected date of weekday not adjusted to start of week
     * @fires   Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    weekDatepickerValueChanged: function (model, dates) {
        const api = this.get("propTrafficCountApi"),
            thingId = this.get("propThingId"),
            meansOfTransport = this.get("propMeansOfTransport"),
            timeSettings = [],
            themeId = this.get("themeId"),
            selector = "trafficCountDiagramWeek_" + themeId;

        if (dates.length === 0) {
            this.removeCanvas(selector);
            this.setWeekTableContent([]);
        }
        else {
            dates.sort((earlyDate, lateDate) => {
                // Showing earlier date first
                return earlyDate - lateDate;
            }).forEach(date => {
                timeSettings.push({
                    interval: this.get("weekInterval"),
                    from: moment(date).startOf("isoWeek").format("YYYY-MM-DD"),
                    until: moment(date).endOf("isoWeek").format("YYYY-MM-DD")
                });
            });

            api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {

                this.refreshDiagramWeek(datasets, meansOfTransport, selector);
                this.prepareTableContent(this.prepareDatasetHourly(datasets), "week", this.get("weekLabel"), timeSettings, meansOfTransport);

            }, errormsg => {
                this.refreshDiagramWeek([]);
                this.setWeekTableContent([]);

                console.warn("The data received from api are incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Die gewünschten Daten wurden wegen eines API-Fehlers nicht korrekt empfangen.",
                    category: "Info"
                });
            });
        }
    },

    /**
     * Setup of the year tab.
     * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
     * @listens Snippets#ValuesChanged
     * @returns {Void}  -
     */
    setupTabYear: function () {
        const datepicker = this.get("yearDatepicker"),
            startDate = moment("2020-01-01");

        // create datepicker only on first enter of tab
        if (!datepicker) {
            this.set("yearDatepicker", new SnippetDatepickerModel({
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
                language: this.get("currentLng")
            }));

            this.listenTo(this.get("yearDatepicker"), {
                "valuesChanged": this.yearDatepickerValueChanged
            });
            this.trigger("renderYearDatepicker");
            this.get("yearDatepicker").updateValues(moment().startOf("year").toDate());
        }
        else {
            this.trigger("renderYearDatepicker");
        }
    },

    /** Function is initially triggered and on update
     * @param   {Backbone.Model} model DatePickerValue Model
     * @param   {Date} dates an unsorted array of first day date of selected year
     * @fires   Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    yearDatepickerValueChanged: function (model, dates) {
        const api = this.get("propTrafficCountApi"),
            thingId = this.get("propThingId"),
            meansOfTransport = this.get("propMeansOfTransport"),
            timeSettings = [],
            years = [],
            themeId = this.get("themeId"),
            selector = "trafficCountDiagramYear_" + themeId;

        if (dates.length === 0) {
            this.removeCanvas(selector);
            this.setYearTableContent([]);
        }
        else {
            dates.sort((earlyDate, lateDate) => {
                // Showing earlier date first
                return earlyDate - lateDate;
            }).forEach(date => {
                years.push(moment(date).format("YYYY"));
                timeSettings.push({
                    interval: this.get("yearInterval"),
                    // subtract 3 days to savely include the first thursday of january into the interval, as the first calendar week always includes the first thursday of january
                    from: moment(date).startOf("year").subtract(3, "days").format("YYYY-MM-DD"),
                    // add 3 days to savely include the last thursday of december into the interval, as the last calendar week always includes the last thursday of december
                    until: moment(date).endOf("year").add(3, "days").format("YYYY-MM-DD"),
                    selectedYear: moment(date).format("YYYY")
                });
            });

            api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {

                this.refreshDiagramYear(datasets, years, meansOfTransport, selector);
                this.prepareTableContent(this.prepareYearDataset(datasets), "year", this.get("yearLabel"), timeSettings, meansOfTransport);

            }, errormsg => {
                this.refreshDiagramYear([]);
                this.setYearTableContent([]);

                console.warn("The data received from api are incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Die gewünschten Daten wurden wegen eines API-Fehlers nicht korrekt empfangen.",
                    category: "Info"
                });
            });
        }
    },

    /**
     * refreshes the diagram for a dataset based on day
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @param {String} meansOfTransport - AnzFahrzeuge | Anzahl_Fahrraeder | AntSV
     * @param {String} selector the dom selector of the diagram (e.g. an id as "#...")
     * @returns {Void}  -
     */
    refreshDiagramDay: function (dataset, meansOfTransport, selector) {
        const xAxisTickValues = this.getXAxisTickValuesDay(),
            emptyDiagramData = this.getEmptyDiagramDataDay(),
            generalConfigParams = {
                dataset: dataset,
                meansOfTransport: meansOfTransport,
                selector: selector,
                xAxis: {
                    xAttr: "hour",
                    xAxisTicks: {
                        unit: " " + this.get("clockLabel"),
                        values: xAxisTickValues
                    }
                },
                yAxis: {
                    yAttr: "count",
                    yAxisText: this.get("yAxisTextDay")
                }
            };

        this.refreshDiagramGeneral(generalConfigParams, datetime => {
            // callbackRenderLegendText
            return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY");
        }, datetime => {
            // callbackRenderTextXAxis
            return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("HH:mm");
        }, (value, dotData) => {
            // setTooltipValue
            return dotData.hour + " " + this.get("clockLabel") + ": " + this.addThousandPoints(value);
        }, emptyDiagramData);
    },

    /**
     * refreshes the diagram for a dataset based on week
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @param {String} meansOfTransport - AnzFahrzeuge | Anzahl_Fahrraeder | AntSV
     * @param {String} selector the dom selector of the diagram (e.g. an id as "#...")
     * @returns {Void}  -
     */
    refreshDiagramWeek: function (dataset, meansOfTransport, selector) {
        const xAxisTickValues = this.getXAxisTickValuesWeek(),
            emptyDiagramData = this.getEmptyDiagramDataWeek(),
            generalConfigParams = {
                dataset: dataset,
                meansOfTransport: meansOfTransport,
                selector: selector,
                xAxis: {
                    xAttr: "weekday",
                    xAxisTicks: {
                        unit: "",
                        values: xAxisTickValues
                    }
                },
                yAxis: {
                    yAttr: "count",
                    yAxisText: this.get("yAxisTextWeek")
                }
            };

        this.refreshDiagramGeneral(generalConfigParams, datetime => {
            // callbackRenderLegendText
            const weeknumber = moment(datetime, "YYYY-MM-DD HH:mm:ss").week(),
                year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");

            return this.get("calendarweek") + " " + weeknumber + " / " + year;
        }, datetime => {
            // callbackRenderTextXAxis
            const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss");

            return objMoment.format("dd");
        }, (value, dotData) => {
            // setTooltipValue
            const objMoment = moment(dotData.date, "YYYY-MM-DD HH:mm:ss");

            return objMoment.format("DD.MM.YYYY") + ": " + this.addThousandPoints(value);
        }, emptyDiagramData);
    },

    /**
     * refreshes the diagram for a dataset based on year
     * @param {Object} dataset the dataset to refresh the diagram with as object{date: value}
     * @param {String} year the year from the calendar as String
     * @param {String} meansOfTransport - AnzFahrzeuge | Anzahl_Fahrraeder | AntSV
     * @param {String} selector the dom selector of the diagram (e.g. an id as "#...")
     * @returns {Void}  -
     */
    refreshDiagramYear: function (dataset, year, meansOfTransport, selector) {
        const xAxisTickValues = this.getXAxisTickValuesYear(),
            emptyDiagramData = this.getEmptyDiagramDataYear(year),
            generalConfigParams = {
                dataset: dataset,
                meansOfTransport: meansOfTransport,
                selector: selector,
                xAxis: {
                    xAttr: "week",
                    xAxisTicks: {
                        unit: "",
                        values: xAxisTickValues
                    }
                },
                yAxis: {
                    yAttr: "count",
                    yAxisText: this.get("yAxisTextYear")
                }
            };

        this.refreshDiagramGeneral(generalConfigParams, datetime => {
            // callbackRenderLegendText
            return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");
        }, datetime => {
            // callbackRenderTextXAxis
            // use thursday as fixure of the week, as the calendar week is fixated to thursday
            const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days"),
                thisWeeksMonth = objMoment.format("MMM"),
                thisWeek = objMoment.format("WW"),
                lastWeeksMonth = objMoment.subtract(1, "week").format("MMM");

            if (thisWeeksMonth !== lastWeeksMonth) {
                return thisWeeksMonth;
            }

            return thisWeeksMonth + "-" + thisWeek;
        }, (value, dotData) => {
            // setTooltipValue
            // use thursday as fixure of the week, as the calendar week is fixated to thursday
            const objMoment = moment(dotData.date, "YYYY-MM-DD HH:mm:ss").add(3, "days");

            return this.get("calendarweek") + " " + objMoment.format("WW") + " / " + objMoment.format("YYYY") + ": " + this.addThousandPoints(value);
        }, emptyDiagramData);
    },

    /**
     * refreshes the diagram with the given data
     * @param {Object} generalConfigParams main configuration
     * @param {Object} generalConfigParams.dataset the dataset to refresh the diagram with as object{date: value}
     * @param {String} generalConfigParams.selector the dom selector of the diagram (e.g. an id as "#...")
     * @param {Object} generalConfigParams.xAxis.xAxisTicks an object to define the behavior of the xAxis as object{unit, values}
     * @param {String} generalConfigParams.yAxis.yAxisText the text of the y axis
     * @param {Callback} callbackRenderLegendText a function (phenomenonTime) to write the legend text with
     * @param {Callback} callbackRenderTextXAxis a function (phenomenonTime) to write the entry at the x axis with
     * @param {Callback} setTooltipValue a function value:=function(value, xAxisAttr) to set/convert the tooltip value that is shown hovering a point - if not set or left undefined: default is >(...).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")< due to historic reasons
     * @param {Object} emptyDiagramData empty diagram dataset to be filled by dataset as object{xAxisValue: {xAxisAttr}}
     * @returns {Void}  -
     */
    refreshDiagramGeneral: function (generalConfigParams, callbackRenderLegendText, callbackRenderTextXAxis, setTooltipValue, emptyDiagramData) {
        if (typeof generalConfigParams.dataset !== "object" || generalConfigParams.dataset.length === 0) {
            this.removeCanvas(generalConfigParams.selector);
            return;
        }

        const dataset = generalConfigParams.dataset,
            meansOfTransport = generalConfigParams.meansOfTransport,
            selector = generalConfigParams.selector,
            xAttr = generalConfigParams.xAxis.xAttr,
            xAxisTicks = generalConfigParams.xAxis.xAxisTicks,
            yAttr = generalConfigParams.yAxis.yAttr,
            yAxisText = generalConfigParams.yAxis.yAxisText,
            colors = ["#337ab7", "#d73027", "#fc8d59", "#91bfdb", "#542788"],
            dataSets = this.getDataSetsForChart(dataset, meansOfTransport, colors, xAttr, yAttr, callbackRenderLegendText, callbackRenderTextXAxis, emptyDiagramData),
            config = {
                type: "line",
                pointHoverRadius: 2,
                data: {
                    labels: xAxisTicks.values,
                    datasets: dataSets
                },
                options: {
                    title: {
                        display: false
                    },
                    elements: {
                        line: {
                            tension: 0
                        }
                    },
                    tooltips: {
                        bodyFontColor: "#555555",
                        backgroundColor: "#f0f0f0",
                        yAlign: "bottom",
                        custom: function (tooltip) {
                            if (!tooltip) {
                                return;
                            }
                            // disable displaying the color box;
                            tooltip.displayColors = false;
                        },
                        callbacks: {
                            // use label callback to return the desired label
                            label: function (tooltipItem) {
                                return setTooltipValue(tooltipItem.yLabel, this.getLineData(xAttr, yAttr, callbackRenderTextXAxis, dataset[tooltipItem.datasetIndex][meansOfTransport], emptyDiagramData)[tooltipItem.index]);
                            }.bind(this),
                            // remove title
                            title: function () {
                                return false;
                            }
                        }
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true,
                        onHover: function (e) {
                            const point = this.getElementAtEvent(e);

                            if (point.length) {
                                e.target.style.cursor = "pointer";
                            }
                            else {
                                e.target.style.cursor = "default";
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            ticks: {
                                fontSize: 10,
                                fontColor: "#000000",
                                beginAtZero: true,
                                autoSkip: true,
                                maxTicksLimit: xAttr === "hour" ? 12 : "",
                                callback: function (value) {
                                    return value + " " + xAxisTicks.unit;
                                }
                            },
                            gridLines: {
                                color: "black",
                                display: true,
                                drawBorder: true,
                                drawOnChartArea: false
                            }
                        }],
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                fontSize: 10,
                                fontColor: "#000000",
                                maxTicksLimit: 8,
                                callback: function (value) {
                                    return this.addThousandPoints(value);
                                }.bind(this)
                            },
                            gridLines: {
                                color: "black",
                                display: true,
                                drawBorder: true,
                                drawOnChartArea: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: yAxisText
                            }
                        }]
                    },
                    legend: {
                        display: true,
                        onClick: (e) => e.stopPropagation(),
                        labels: {
                            usePointStyle: true,
                            fontSize: 12,
                            fontColor: "#555555"
                        },
                        align: "start"
                    }
                }
            };

        let canvasArea = "";

        this.removeCanvas(selector);
        document.getElementsByClassName(selector)[0].appendChild(document.createElement("canvas"));

        canvasArea = document.getElementsByClassName(selector)[0].querySelector("canvas").getContext("2d");

        ChartJs.defaults.global.elements.line.spanGaps = false;
        ChartJs.defaults.global.elements.line.fill = false;
        ChartJs.defaults.global.elements.line.borderWidth = 1;
        ChartJs.defaults.global.elements.point.borderWidth = 1;
        ChartJs.defaults.global.elements.point.radius = 2;

        ChartJs.Legend.prototype.afterFit = function () {
            this.height = this.height + 10;
        };

        if (Array.isArray(dataSets) && dataSets.length > 0) {
            window.chartLine = new ChartJs(canvasArea, config);
        }
    },

    /**
     * remove Chart canvas from dom
     * @param {String} selector the dom selector of the diagram (e.g. an id as "#...")
     * @returns {void}
     */
    removeCanvas: function (selector) {
        const canvasElement = document.getElementsByClassName(selector)[0].querySelector("canvas");

        if (canvasElement) {
            canvasElement.parentNode.removeChild(canvasElement);
        }
    },

    /**
     *get Data set in right format for drawing the chart
     * @param {Array} dataset the dataset getting from api
     * @param {String} meansOfTransport - AnzFahrzeuge | Anzahl_Fahrraeder | AntSV
     * @param {Array} colors the color to be signed to every data list
     * @param {String} xAttr the attribute to use for x axis values (e.g. week, weekday, hour)
     * @param {String} yAttr the attribute to use for y axis values (e.g. value1234, number5222) - must be unique for this line as it is used as attrName in attrToShowArray as well
     * @param {Callback} callbackRenderLegendText a function (phenomenonTime) to write the legend text with
     * @param {Callback} callbackRenderTextXAxis a function (phenomenonTime) to convert the key of dataset into the wanted format with
     * @param {Object} emptyDiagramData empty diagram dataset to be filled by dataset as object{xAxisValue: {xAxisAttr}}
     * @returns {Object[]}  the result by reference to add the new data to: the result is an array of objects{(xAttr), (yAttr)} that can be used as dataset for the chart diagram
     */
    getDataSetsForChart: function (dataset, meansOfTransport, colors, xAttr, yAttr, callbackRenderLegendText, callbackRenderTextXAxis, emptyDiagramData) {
        if (!Array.isArray(dataset) || dataset.length === 0) {
            return false;
        }

        const dataSets = [];

        dataset.forEach(function (data, index) {
            if (!data.hasOwnProperty(meansOfTransport) || Object.keys(data[meansOfTransport]).length === 0) {
                console.warn("The data received from api are incomplete!");
                return;
            }

            const lineData = this.getLineData(xAttr, yAttr, callbackRenderTextXAxis, data[meansOfTransport], emptyDiagramData),
                pointData = Array.isArray(lineData) && dataset.length > 0 ? this.getPointData(lineData) : [],
                legendData = callbackRenderLegendText(Object.keys(data[meansOfTransport])[0]),
                dataObject = {
                    label: legendData,
                    backgroundColor: colors[index],
                    borderColor: colors[index],
                    data: pointData
                };

            dataSets.push(dataObject);
        }.bind(this));

        return dataSets;
    },

    /**
     * adds objects to use as diagram data to the given result set
     * @param {String} xAttr the attribute to use for x axis values (e.g. week, weekday, hour)
     * @param {String} yAttr the attribute to use for y axis values (e.g. value1234, number5222) - must be unique for this line as it is used as attrName in attrToShowArray as well
     * @param {Callback} callbackRenderTextXAxis a function (phenomenonTime) to convert the key of dataset into the wanted format with
     * @param {Object[]} dataset the dataset from the API as array of objects{phenomenonTime: value}
     * @param {Object} emptyDiagramData empty diagram dataset to be filled by dataset as object{xAxisValue: {xAxisAttr}}
     * @returns {Object[]}  the result by reference to add the new data to: the result is an array of objects{(xAttr), (yAttr)} that can be used as dataset for the chart diagram
     */
    getLineData: function (xAttr, yAttr, callbackRenderTextXAxis, dataset, emptyDiagramData) {
        if (typeof dataset !== "object" || typeof emptyDiagramData !== "object" || typeof callbackRenderTextXAxis !== "function") {
            return [];
        }

        const diagramData = Object.assign({}, emptyDiagramData);

        let key;

        for (key in dataset) {
            const obj = {
                date: key
            };

            obj[xAttr] = callbackRenderTextXAxis(key);
            obj[yAttr] = dataset[key];

            diagramData[obj[xAttr]] = obj;
        }

        return Object.values(diagramData);
    },

    /**
     * adds objects to use as diagram data to the given result set
     * @param {Object[]} lineData the data from a data list
     * @returns {Object[]}  the result by reference to add the new data to: the result is an array of objects{(xAttr), (yAttr)} that can be used as dataset for the chart diagram
     */
    getPointData: function (lineData) {
        const pointData = [];

        lineData.forEach(data => {
            if (data.hasOwnProperty("count") && data.hasOwnProperty("date")) {
                pointData.push(data.count);
            }
            else {
                pointData.push(null);
            }
        });

        return pointData;
    },

    /**
     * returns an array of xAxis Attributes to be shown in the diagram
     * @return {String[]}  an array with relevant xAxis Attributes for the day diagram
     */
    getXAxisTickValuesDay: function () {
        // x - minutes interval
        // times - time array
        const x = 15,
            times = [];

        // tt - start time
        let tt = 0,
            i = 0;

        for (i = 0; tt <= 24 * 60; i++) {
            // getting hours of day in 0-24 format
            // getting minutes of the hour in 0-55 format
            const hh = Math.floor(tt / 60),
                mm = tt % 60;

            times[i] = ("0" + hh).slice(-2) + ":" + ("0" + mm).slice(-2); // pushing data in array in [ 00:00 - 24:00 format]
            tt = tt + x;
        }

        return times;
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
        let kw = 0;

        for (kw = 1; kw <= moment().isoWeeksInYear(); kw++) {
            kw = kw < 10 ? "0" + kw : kw;
            xAxisTickValues.push(this.get("calendarweek") + kw);
        }

        return xAxisTickValues;
    },

    /**
     * generates an empty dataset of diagram data to be used as pattern for the diagramData
     * @info this is necessary to expand the year, week or day diagram to full span
     * @return {Object}  an empty dataset for the day as object{xAttr: {hour}}
     */
    getEmptyDiagramDataDay: function () {
        const result = {};
        let key,
            h,
            m;

        for (h = 0; h < 24; h++) {
            for (m = 0; m < 4; m++) {
                key = String(h).padStart(2, "0") + ":" + String(m * 15).padStart(2, "0");

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
     * @return {Object}  an empty dataset for the week as object{xAttr: {hour}}
     */
    getEmptyDiagramDataWeek: function () {
        const result = {};
        let key,
            wd;

        for (wd = 1; wd <= 7; wd++) {
            key = moment(wd % 7, "d").format("dd");
            result[key] = {
                weekday: key
            };
        }

        return result;
    },

    /**
     * generates an empty dataset of diagram data to be used as pattern for the diagramData
     * @param {String} year the year to use in format YYYY
     * @info this is necessary to expand the year, week or day diagram to full span
     * @return {Object}  an empty dataset for the year as object{xAttr: {hour}}
     */
    getEmptyDiagramDataYear: function (year) {
        const result = {},
            // set moment to the first thursday (00:00:00) of the year, as the first calendar week always includes the first thursday of january
            objMoment = moment(String(year) + "-1", "YYYY-W").add(3, "days");
        let key,
            lastMonth = "";

        while (objMoment.format("YYYY") === String(year)) {
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
     * adds thousands points into a absolute number
     * @param {Integer} value the absolute number as integer
     * @returns {String}  the same number but with thousands points or "0" if an invalid value was given
     */
    addThousandPoints: function (value) {
        if (typeof value !== "number" && typeof value !== "string") {
            return "";
        }

        return value.toString().replace(/\B(?=(\d{3})+(?!\d),?.*)/g, ".");
    },

    /**
     * gets the download data for the last 7 days for the given thingId and meansOfTransport
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'AnzFahrzeuge'
     * @param {Callback} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    downloadDataDay: function (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
        const api = this.get("propTrafficCountApi"),
            timeSet = {
                interval: this.get("dayInterval"),
                from: moment().subtract(7, "days").format("YYYY-MM-DD"),
                until: moment().format("YYYY-MM-DD")
            };

        api.downloadData(thingId, meansOfTransport, timeSet, onsuccess, onerror, onstart, oncomplete);
    },

    /**
     * gets the download data for the 54 weeks for the given thingId and meansOfTransport
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'AnzFahrzeuge'
     * @param {Callback} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    downloadDataWeek: function (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
        const api = this.get("propTrafficCountApi"),
            timeSet = {
                interval: this.get("weekInterval"),
                from: moment().subtract(54, "weeks").format("YYYY-MM-DD"),
                until: moment().format("YYYY-MM-DD")
            };

        api.downloadData(thingId, meansOfTransport, timeSet, onsuccess, onerror, onstart, oncomplete);
    },

    /**
     * gets the download data since the beginning
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'AnzFahrzeuge'
     * @param {Callback} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    downloadDataYear: function (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
        const api = this.get("propTrafficCountApi");

        api.getFirstDateEver(thingId, meansOfTransport, firstDate => {
            const timeSet = {
                interval: this.get("yearInterval"),
                from: firstDate,
                until: moment().format("YYYY-MM-DD")
            };

            api.downloadData(thingId, meansOfTransport, timeSet, onsuccess, onerror, false, oncomplete);
        }, onerror, onstart, false);
    },

    /**
     * Setter for dayTableContent
     * @param {Object} value Contains the taleContent
     * @returns {void}
     */
    setDayTableContent: function (value) {
        this.set("dayTableContent", value);
    },

    /**
     * Setter for weekTableContent
     * @param {Object} value Contains the taleContent
     * @returns {void}
     */
    setWeekTableContent: function (value) {
        this.set("weekTableContent", value);
    },

    /**
     * Setter for weekTableContent
     * @param {Object} value Contains the taleContent
     * @returns {void}
     */
    setYearTableContent: function (value) {
        this.set("yearTableContent", value);
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
