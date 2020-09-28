import Theme from "../model";
import * as moment from "moment";

const ElektroladesaeulenTheme = Theme.extend({

    initialize: function () {
        const channel = Radio.channel("elektroladesaeulenTheme");

        this.listenTo(this, {
            "change:isReady": this.parseProperties,
            "change:isVisible": this.loadData
        });

        this.listenTo(channel, {
            "changeGfi": this.changeData
        });
    },

    /**
     * generates the properties to be displayed when creating the gfi
     * @returns {void}
     */
    parseProperties: function () {
        let gfiProperties = this.splitProperties(gfiContent[0]);
        const gfiContent = this.get("gfiContent"),
            allProperties = this.splitProperties(gfiContent.allProperties),
            dataStreamIds = allProperties.dataStreamId,
            requestUrl = allProperties.requestUrl[0],
            versionUrl = allProperties.versionUrl[0],
            gfiParams = this.get("feature").get("gfiParams"),
            utc = this.get("feature").get("utc"),
            headTitleObject = this.createGfiHeadingChargingStation(allProperties),
            tableheadArray = this.createGfiTableHeadingChargingStation(allProperties);

        gfiProperties = this.changeStateToGerman(gfiProperties);

        // set Properties
        this.setRequestUrl(requestUrl);
        this.setVersionUrl(versionUrl);
        this.setDataStreamIds(dataStreamIds);
        this.setGfiParams(gfiParams);
        this.setUTC(utc);
        this.setHeadTitleObject(headTitleObject);
        this.setTableheadArray(tableheadArray);
        this.setGfiProperties(gfiProperties);
    },

    /**
     * processes the historical data and the indicators as soon as the gfi is visible
     * @returns {void}
     */
    loadData: function () {
        let gfiContent,
            allProperties,
            dataStreamIds,
            gfiParams,
            historicalData,
            historicalDataClean,
            endDay,
            lastDay,
            dataByWeekday;

        if (this.get("isVisible") === true) {
            gfiContent = this.get("gfiContent");
            allProperties = this.splitProperties(gfiContent.allProperties);
            dataStreamIds = allProperties.dataStreamId;
            gfiParams = this.get("gfiParams");
            historicalData = this.createHistoricalData(false, dataStreamIds, gfiParams);
            historicalDataClean = this.dataCleaning(historicalData);
            lastDay = this.get("lastDate") === undefined ? "" : moment(this.get("lastDate")).format("YYYY-MM-DD");
            endDay = moment().format("YYYY-MM-DD");
            dataByWeekday = this.processDataForAllWeekdays(historicalDataClean, lastDay, endDay);

            this.setDataStreamIds(dataStreamIds);
            this.setWeekday(dataByWeekday);
        }
    },

    /**
     * change gfi, if the tab-toogle "daten" ist active
     * @returns {void}
     */
    changeData: function () {
        let value;

        this.parseProperties();
        this.loadData();

        $("li").each(function () {
            if ($(this).hasClass("active")) {
                value = $(this).attr("value");
            }
        });

        if (value === "daten") {
            Radio.trigger("gfiView", "render");
        }
    },

    /**
     * split properties by pipe (|)
     * @param  {Object} [properties={}] - from chargingstation
     * @return {Object} propertiesObj
     */
    splitProperties: function (properties = {}) {
        const propertiesObj = {};

        Object.entries(properties).forEach(prop => {
            const value = typeof prop[1] === "number" ? prop[1].toString() : prop[1],
                key = prop[0];

            if (typeof value === "object" && !Array.isArray(value)) {
                propertiesObj[key] = [""];
            }
            else if (value === "|" || value.includes("|")) {
                propertiesObj[key] = String(value).split("|");
            }
            else {
                propertiesObj[key] = [String(value)];
            }

            // remove blanks
            propertiesObj[key].forEach((str, index) => {
                propertiesObj[key][index] = str.trim();
            });
        });

        return propertiesObj;
    },

    /**
     * creates the heading for the gfi of charging stations
     * @param  {Object} [allProperties={}] - from chargingstation
     * @return {Object} headTitleObject
     */
    createGfiHeadingChargingStation: function (allProperties = {}) {
        const headTitleObject = {};

        headTitleObject.StandortId = allProperties.hasOwnProperty("chargings_station_nr") ? String(allProperties.chargings_station_nr[0]) : "";
        headTitleObject.Adresse = allProperties.hasOwnProperty("chargings_station_nr") && allProperties.hasOwnProperty("postal_code") && allProperties.hasOwnProperty("city")
            ? allProperties.location_name[0] + ", " + allProperties.postal_code[0] + " " + allProperties.city[0] : "";
        headTitleObject.Eigentümer = allProperties.hasOwnProperty("owner") ? allProperties.owner[0] : "";

        return headTitleObject;
    },

    /**
     * creates the heading for the table in the gfi of charging stations
     * @param  {Object} [allProperties={}] - from chargingstation
     * @return {Array} tableheadArray
     */
    createGfiTableHeadingChargingStation: function (allProperties = {}) {
        const stationNumbers = allProperties.hasOwnProperty("sms_no_charging_station") ? allProperties.sms_no_charging_station : [],
            tableheadArray = [];

        stationNumbers.forEach(num => {
            tableheadArray.push("Ladepunkt: " + num);
        });

        return tableheadArray;
    },

    /**
     * changes the states from englisch to german
     * @param  {Object} [gfiProperties={}] - with english state
     * @return {Object} gfiProperties - with german state
     */
    changeStateToGerman: function (gfiProperties = {}) {
        const translateObj = {
                available: "Frei",
                charging: "Belegt",
                outoforder: "Außer Betrieb"
            },
            gfiPropertiesGermanStatus = gfiProperties.hasOwnProperty("Zustand") ? gfiProperties.Zustand : [];

        gfiPropertiesGermanStatus.forEach((state, index) => {
            if (Object.keys(translateObj).includes(state.toLowerCase())) {
                gfiProperties.Zustand[index] = translateObj[state];
            }
            else {
                gfiProperties.Zustand[index] = "";
            }

        });

        return gfiProperties;
    },

    /**
     * builds the request and collect the historical data for each datastream
     * one object with results and phenomenonTimes for every chargingpoint
     * @param  {Boolean} async - mode for ajax
     * @param  {Boolean} dataStreamIds - from features
     * @param  {Boolean} gfiParams - limits the period of observations
     * @return {Object[]} historicalData
     */
    createHistoricalData: function (async, dataStreamIds, gfiParams) {
        const requestUrl = this.get("requestUrl"),
            versionUrl = this.get("versionUrl");

        let query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc",
            historicalData = "",
            completeUrl = "";

        // add gfiParams an filter to query
        query = this.addGfiParams(query, gfiParams);
        query = this.addFilter(query, dataStreamIds);

        completeUrl = this.buildRequestFromQuery(query, requestUrl, versionUrl);
        historicalData = this.sendRequest(completeUrl, async);

        // if with one request not all data can be fetched
        historicalData.forEach(data => {
            const observationsId = data["@iot.id"],
                observationsCount = data["Observations@iot.count"],
                observationsLength = data.Observations.length;
            let skipCompleteUrl,
                skipHistoricalData;

            // this.moreHistoricalData(data, observationsCount, completeUrl, observationsLength, observationsId, async);
            while (observationsCount > data.Observations.length) {
                skipCompleteUrl = completeUrl.split(")")[0] + ";$skip=" + observationsLength + ")&$filter=@iot.id eq'" + observationsId + "'";
                skipHistoricalData = this.sendRequest(skipCompleteUrl, async);

                data.Observations.push.apply(data.Observations, skipHistoricalData[0].Observations);
            }
        });

        return historicalData;
    },


    /**
     * adds filter to a given query
     * @param {String} query - filter load observations
     * @param {String[]} dataStreamIds - from feature
     * @return {Object[]} workingQuery
     */
    addFilter: function (query, dataStreamIds) {
        let workingQuery = query + ")&$filter=";

        dataStreamIds.forEach((id, index) => {
            const dataStreamIdLen = dataStreamIds.length - 1;

            workingQuery = workingQuery + "@iot.id eq'" + id + "'";
            if (index !== dataStreamIdLen) {
                workingQuery = workingQuery + "or ";
            }
        });

        return workingQuery;
    },

    /**
     * adds time params to query by given gfiParams
     * @param {String} query - filter load observations
     * @param {Object} [gfiParams={}] - attributes that specify the historical data period
     * @return {String} extended query
     */
    addGfiParams: function (query, gfiParams = {}) {
        const startDate = gfiParams.hasOwnProperty("startDate") ? gfiParams.startDate : undefined,
            periodTime = gfiParams.hasOwnProperty("periodTime") ? gfiParams.periodTime : undefined,
            periodUnit = gfiParams.hasOwnProperty("periodUnit") ? gfiParams.periodUnit : undefined;

        let workingQuery = query === undefined ? "" : query,
            endDate = gfiParams.hasOwnProperty("endDate") ? gfiParams.endDate : undefined,
            lastDate,
            time,
            translateUnit,
            unit;

        // handle Dates
        if (startDate !== undefined) {
            lastDate = moment(startDate, "DD.MM.YYYY");
            // request 3 more weeks to find the latest status
            time = moment(startDate, "DD.MM.YYYY").subtract(3, "weeks").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
            workingQuery = workingQuery + ";$filter=phenomenonTime gt " + time;

            if (endDate !== undefined) {
                endDate = moment(endDate, "DD.MM.YYYY").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
                workingQuery = workingQuery + " and phenomenonTime lt " + endDate;
            }
        }
        // handle period
        else if (periodTime !== undefined && periodUnit !== undefined) {
            translateUnit = {
                Jahr: "years",
                Monat: "months",
                Woche: "weeks",
                Tag: "days",
                Jahre: "years",
                Monate: "months",
                Wochen: "weeks",
                Tage: "days"
            };
            unit = translateUnit[periodUnit];

            // request 3 more weeks to find the latest status
            time = moment().subtract(periodTime, unit).subtract(3, "weeks").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";

            lastDate = moment().subtract(periodTime, unit);
            workingQuery = workingQuery + ";$filter=phenomenonTime gt " + time;
        }

        // necessary for processing historical data
        this.setLastDate(lastDate);

        return workingQuery;
    },

    /**
     * create the request with given query for one Datastream
     * @param  {String} query - add filter to url
     * @param  {String} requestUrl - url to service
     * @param  {String} versionUrl - version of the service
     * @return {String} complete Url
     */
    buildRequestFromQuery: function (query, requestUrl, versionUrl) {
        let completeUrl;

        if ((query || requestUrl) === undefined || isNaN(parseFloat(versionUrl, 10))) {
            completeUrl = "";
        }
        else {
            completeUrl = requestUrl + "/"
                + "v" + versionUrl + "/"
                + "Datastreams" + query;
        }

        return completeUrl;
    },

    /**
     * returns the historicalData by Ajax-Request
     * @param  {String} requestUrlHistoricaldata - url with query
     * @param  {Boolean} async - state fo ajax-request
     * @return {Object[]} historicalData
     */
    sendRequest: function (requestUrlHistoricaldata, async) {
        let response;

        $.ajax({
            url: requestUrlHistoricaldata,
            async: async,
            type: "GET",
            context: this,

            // handling response
            success: function (resp) {
                response = resp.value;
            },
            error: function () {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Es ist ein unerwarteter Fehler beim Anfordern der historischen Daten aufgetreten!</strong>",
                    kategorie: "alert-danger"
                });
            }
        });

        return response;
    },

    /**
     * removes doublicates
     * duplicates are records whose phenomenontime is less than 1000 milliseconds
     * and have the same result
     * @param  {Array} [dataArray=[]] - that contains data from the features
     * @return {Array} workingArray - without doublicates
     */
    dataCleaning: function (dataArray = []) {
        const workingArray = dataArray === undefined ? [] : dataArray;

        workingArray.forEach(loadingPoint => {
            const observations = loadingPoint.hasOwnProperty("Observations") ? loadingPoint.Observations : [],
                indexArray = [];

            let lastTime = 0,
                lastState = "";

            observations.forEach((data, index) => {
                const time = moment(data.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss"),
                    state = data.result;

                if (index === 0) {
                    lastTime = time;
                    lastState = state;
                    return;
                }
                else if (Math.abs(moment(lastTime).diff(time)) < 1000 && state === lastState) {
                    indexArray.push(index);
                }

                lastTime = time;
                lastState = state;
            });

            // remove data by indexArray
            indexArray.reverse().forEach(element => {
                observations.splice(element, 1);
            });
        });

        return workingArray;
    },

    /**
     *generates a record for each day of the week
     * @param  {Array} historicalData [description]
     * @param  {Date} lastDay - until this date the data will be evaluated
     * @param  {Date} endDay - the date at which the evaluation should end
     * @return {Array} dataByWeekday
     */
    processDataForAllWeekdays: function (historicalData, lastDay, endDay) {
        const utc = this.get("utc") === undefined ? "+1" : this.get("utc");
        let historicalDataThisTimeZone,
            historicalDataWithIndex,
            dataByWeekday;

        // Check if data is available
        if (this.checkObservationsNotEmpty(historicalData)) {
            historicalDataThisTimeZone = Radio.request("Util", "changeTimeZone", historicalData, utc);
            historicalDataWithIndex = this.addIndex(historicalDataThisTimeZone);
            dataByWeekday = this.divideDataByWeekday(historicalDataWithIndex, lastDay, endDay);
        }
        else {
            dataByWeekday = [];
        }

        return dataByWeekday;
    },

    /**
     * checks if there are any observations
     * @param  {Object[]} [historicalData=[]] - data from feature
     * @return {Boolean} boolean
     */
    checkObservationsNotEmpty: function (historicalData = []) {
        let boolean = false;

        historicalData.forEach(data => {
            const history = data.hasOwnProperty("Observations") ? data.Observations : [];

            if (Object.keys(history).length !== 0) {
                boolean = true;
            }
        });

        return boolean;
    },

    /**
     * add an index to the historicalData
     * @param {Object[]} historicalData -  - data from feature
     * @return {Object[]} data
     */
    addIndex: function (historicalData) {
        const data = historicalData === undefined ? [] : historicalData;

        data.forEach(loadingPointData => {
            const loading = loadingPointData.hasOwnProperty("Observations") ? loadingPointData.Observations : [];

            loading.forEach((obs, index) => {
                obs.index = index;
            });
        });

        return data;
    },

    /**
     * divides the day into 7 days of the week
     * and generate an observation for every day at 0 o'clock
     * @param  {Array} [historicalDataWithIndex=[]] - from features
     * @param  {Date} lastDay - the day on which the evaluation of the data should end
     * @param  {Date} endDay - the date at which the evaluation should end
     * @return {Array} weekArray
     */
    divideDataByWeekday: function (historicalDataWithIndex = [], lastDay, endDay) {
        const weekArray = [
            [], [], [], [], [], [], []
        ];

        historicalDataWithIndex.forEach(historicalData => {
            const observations = historicalData.hasOwnProperty("Observations") ? historicalData.Observations : [];

            let thisLastDay,
                booleanLoop = true,
                actualDay = endDay === undefined ? moment().format("YYYY-MM-DD") : endDay,
                arrayIndex = 0;

            if (observations.length !== 0) {
                thisLastDay = lastDay === undefined || lastDay === "" ? moment(observations[observations.length - 1].phenomenonTime).format("YYYY-MM-DD") : lastDay;
                weekArray[arrayIndex].push([]);
            }

            observations.forEach(data => {
                const phenomenonDay = moment(data.phenomenonTime).format("YYYY-MM-DD");
                let zeroTime,
                    zeroResult,
                    weekArrayIndexLength;

                // until data has been processed
                while (booleanLoop) {
                    weekArrayIndexLength = weekArray[arrayIndex].length - 1;

                    // when the last date is reached, the loop is no longer needed
                    if (moment(actualDay) < moment(thisLastDay)) {
                        booleanLoop = false;
                        weekArray[arrayIndex].pop();
                        break;
                    }
                    else if (phenomenonDay === actualDay) {
                        weekArray[arrayIndex][weekArrayIndexLength].push(data);
                        break; // data was processed
                    }
                    // dd object with 0 o'clock and the status of the current day
                    else {
                        zeroTime = moment(actualDay).format("YYYY-MM-DDTHH:mm:ss");
                        zeroResult = data.result;
                        weekArray[arrayIndex][weekArrayIndexLength].push({phenomenonTime: zeroTime, result: zeroResult});

                        // Danach aktuellen Tag auf vorherigen Tag und ArrayIndex auf nächstes Array setzen
                        actualDay = moment(actualDay).subtract(1, "days").format("YYYY-MM-DD");

                        if (arrayIndex >= 6) {
                            arrayIndex = 0;
                        }
                        else {
                            arrayIndex++;
                        }

                        weekArray[arrayIndex].push([]);
                    }
                }
            });
        });

        return weekArray;
    },

    /**
     * create the config to draw graph
     * @param  {String} targetResult - result to draw
     * @param  {String} graphTag - div
     * @param  {Number} index - day
     * @returns {void}
     */
    triggerToBarGraph: function (targetResult, graphTag, index) {
        const width = this.get("gfiWidth"),
            height = this.get("gfiHeight"),
            dataByWeekday = this.get("weekday"),
            day = moment().subtract(index, "days").format("dddd");

        let dataPerHour = [],
            processedData = [],
            graphConfig = {};

        // need to toggle weekdays
        this.setDayIndex(index);
        // set an error message if the values of processedData are all 0
        if (dataByWeekday.length === 0) {
            this.drawErrorMessage(graphTag, width, height, index);
            return;
        }
        // process data for day with given index (0 = today)
        dataPerHour = this.calculateWorkloadPerDayPerHour(dataByWeekday[index], targetResult);
        processedData = this.calculateSumAndArithmeticMean(dataPerHour);

        // set an error message if the values of processedData are all 0
        if (this.checkValue(processedData, "mean") === undefined) {
            this.drawErrorMessage(graphTag, width, height, index);
            return;
        }

        // config for style the graph
        graphConfig = {
            graphType: "BarGraph",
            selector: graphTag,
            width: width,
            height: height - 5,
            margin: {top: 20, right: 20, bottom: 50, left: 50},
            svgClass: "BarGraph-svg",
            data: processedData,
            scaleTypeX: "linear",
            scaleTypeY: "linear",
            yAxisTicks: {
                start: 0,
                end: 1,
                ticks: 10,
                factor: "%"
            },
            xAxisTicks: {
                start: 0,
                end: 24,
                ticks: 12,
                unit: "Uhr"
            },
            xAxisLabel: {
                label: this.createXAxisLabel(day, targetResult),
                offset: 10,
                textAnchor: "middle",
                fill: "#000",
                fontSize: 12
            },
            yAxisLabel: {},
            xAttr: "hour",
            attrToShowArray: ["mean"]
        };

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * message if data is not evaluable or not existing
     * @param  {String} graphTag - div to draw graph
     * @param  {Number} width - from frame
     * @param  {Number} height - from frame
     * @param  {Number} index - day
     * @returns {void}
     */
    drawErrorMessage: function (graphTag, width, height, index) {
        const today = moment().subtract(index, "days").format("dddd");

        $(".ladesaeulen .day").text(today);
        $("<div class='noData' style='height: " + height + "px; width: " + width + "px;'>")
            .appendTo("div" + graphTag)
            .text("Zurzeit keine Informationen!");
    },

    /**
     * calculate workload for every day
     * the workload is divided into 24 hours
     * @param  {Array} [dataByWeekday=[]] - historical data sorted by weekday
     * @param  {String} targetResult - result to draw
     * @return {Array} allDataArray
     */
    calculateWorkloadPerDayPerHour: function (dataByWeekday = [], targetResult) {
        const allDataArray = [];

        dataByWeekday.forEach(dayData => {
            const zeroTime = moment(moment(dayData[0].phenomenonTime).format("YYYY-MM-DD")).format("YYYY-MM-DDTHH:mm:ss"),
                firstTimeDayData = moment(dayData[0].phenomenonTime).format("YYYY-MM-DDTHH:mm:ss"),
                emptyDayObj = this.createInitialDayPerHour();
            let dayObj = {};

            if (firstTimeDayData !== zeroTime && Array.isArray(dayData)) {
                dayData.reverse();
            }

            dayObj = this.calculateWorkloadforOneDay(emptyDayObj, dayData, targetResult);
            allDataArray.push(dayObj);
        });

        return allDataArray;
    },

    /**
     * create an object with 24 pairs, which represents 24 hours for one day
     * the values are by initialize 0
     * @return {Object} dayObj
     */
    createInitialDayPerHour: function () {
        const dayObj = {};

        for (let i = 0; i < 24; i++) {
            dayObj[i] = 0;
        }

        return dayObj;
    },

    /**
     * calculate the workload for one day
     * @param  {Object} emptyDayObj - contains 24 objects
     * @param  {Object[]} dayData - observations from one date
     * @param  {String} targetResult - result to draw
     * @return {Object} dayObj
     */
    calculateWorkloadforOneDay: function (emptyDayObj, dayData, targetResult) {
        const dataFromDay = dayData === undefined ? [] : dayData,
            startDate = dataFromDay.length > 0 && dataFromDay[0].hasOwnProperty("phenomenonTime") ? moment(dataFromDay[0].phenomenonTime).format("YYYY-MM-DD") : "",
            dayObj = emptyDayObj === undefined ? {} : emptyDayObj;

        let actualState = dataFromDay.length > 0 && dataFromDay[0].hasOwnProperty("result") ? dataFromDay[0].result : "",
            actualStateAsNumber = targetResult === actualState ? 1 : 0;

        Object.keys(dayObj).forEach(key => {
            const i = parseFloat(key, 10),
                actualTimeStep = moment(startDate).add(i, "hour").format("YYYY-MM-DDTHH:mm:ss"),
                nextTimeStep = moment(startDate).add(i + 1, "hour").format("YYYY-MM-DDTHH:mm:ss"),
                dataByActualTimeStep = this.filterDataByActualTimeStep(dataFromDay, actualTimeStep, nextTimeStep);

            // if the requested period is in the future
            if (moment(nextTimeStep).toDate().getTime() > moment().toDate().getTime()) {
                dayObj[i] = undefined;
            }
            else if (dataByActualTimeStep.length === 0) {
                dayObj[i] = actualStateAsNumber;
            }
            else {
                dayObj[i] = this.calculateOneHour(dataByActualTimeStep, actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult);
                actualState = dataByActualTimeStep[dataByActualTimeStep.length - 1].result;
                actualStateAsNumber = targetResult === actualState ? 1 : 0;
            }
        });

        return dayObj;
    },

    /**
     * filters out the objects of the current timestep
     * @param  {Array} dayData - observations from one date
     * @param  {String} actualTimeStep - startTime
     * @param  {String} nextTimeStep - endTime
     * @return {Array} dataByActualTimeStep
     */
    filterDataByActualTimeStep: function (dayData, actualTimeStep, nextTimeStep) {
        if (Array.isArray(dayData) === false) {
            return [];
        }
        return dayData.filter(function (data) {
            const dataToCheck = data.hasOwnProperty("phenomenonTime") ? moment(data.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss") : "";

            return dataToCheck >= actualTimeStep && dataToCheck < nextTimeStep;
        });
    },

    /**
     * calculates the workload for the current hour
     * time calculations in milliseconds
     * @param  {Array} [dataByActualTimeStep=[]] - within an hour
     * @param  {String} actualState - status of the last observation
     * @param  {Number} actualStateAsNumber - state as number 0 or 1
     * @param  {String} actualTimeStep - startTime
     * @param  {String} nextTimeStep - endTime
     * @param  {String} targetResult - result to draw
     * @return {Number} workload
     */
    calculateOneHour: function (dataByActualTimeStep = [], actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult) {
        const endTime = moment(nextTimeStep).toDate().getTime();

        let betweenRes = "",
            timeDiff = 0,
            currentState = actualState,
            currentStateAsNumber = actualStateAsNumber,
            actualPhenomenonTime = moment(actualTimeStep).toDate().getTime();

        dataByActualTimeStep.forEach(data => {
            const state = data.hasOwnProperty("result") ? data.result : currentState;
            let phenomenonTime,
                res;

            if (state !== currentState) {
                phenomenonTime = data.hasOwnProperty("phenomenonTime") ? moment(data.phenomenonTime).toDate().getTime() : "";

                res = (phenomenonTime - actualPhenomenonTime) * currentStateAsNumber;
                timeDiff = timeDiff + res;

                // update the current status and time
                actualPhenomenonTime = phenomenonTime;
                currentState = state;
                currentStateAsNumber = targetResult === currentState ? 1 : 0;
            }
        });

        // add last difference to next full hour
        betweenRes = (endTime - actualPhenomenonTime) * currentStateAsNumber;
        timeDiff = isNaN(betweenRes) ? timeDiff : timeDiff + betweenRes;

        // result in the unit hour, rounded to 3 decimal places
        return Math.round(timeDiff / 3600) / 1000;
    },

    /**
     * calculates the arithemtic Meaning for all datas
     * @param  {Array} dataPerHour - data for every day, according to targetresult
     * @return {Array} dayMeanArray
     */
    calculateSumAndArithmeticMean: function (dataPerHour) {
        const dayLength = 24,
            dayMeanArray = [];

        let sum,
            mean,
            arrayPerHour;

        for (let i = 0; i <= dayLength; i++) {
            // initialize
            sum = 0;
            mean = 0;
            arrayPerHour = this.arrayPerHour(dataPerHour, i);

            if (arrayPerHour.length === 0) {
                break;
            }
            // remove all undefined data
            arrayPerHour = arrayPerHour.filter(value => {
                return value !== undefined;
            });

            // calculate sum of the array with values for one hour
            sum = arrayPerHour.reduce((memo, value) => memo + value);

            // calculate mean of the array with values for one hour
            mean = sum / arrayPerHour.length;

            if (isNaN(mean)) {
                mean = 0;
                sum = 0;
            }

            // push mean to dayMeanArrayn as object
            dayMeanArray.push({
                hour: i,
                sum: Math.round(sum * 1000) / 1000,
                mean: Math.round(mean * 1000) / 1000
            });
        }

        return dayMeanArray;
    },

    /**
     * returns an array which contains values at hour position
     * @param  {Array} [dataPerHour=[]] - data for every day, according to targetresult
     * @param  {Number} position - one hour
     * @return {Array} arrayPerHour
     */
    arrayPerHour: function (dataPerHour = [], position) {
        const arrayPerHour = [];

        dataPerHour.forEach(day => {
            const positionData = parseFloat(Object.fromEntries(Object.entries(day).filter(([key]) => [String(position)].includes(key)))[position], 10);

            if (positionData !== undefined && !isNaN(positionData)) {
                arrayPerHour.push(positionData);
            }
        });

        return arrayPerHour;
    },

    /**
     * checks if processdData is existing
     * if no data is found, undefined will be delivered
     * @param  {Array} [processedData=[]] - data with mean
     * @param  {Array} value - the key is searched
     * @return {Object} first data that was found
     */
    checkValue: function (processedData = [], value) {
        return processedData.find(data => data[value] > 0);
    },


    /**
     * creates the caption for the graph
     * @param  {String} day - the day that is drawing
     * @param  {String} targetResult - result to draw
     * @return {String} label
     */
    createXAxisLabel: function (day, targetResult) {
        let stateLabel,
            label = "";

        if (targetResult === "available") {
            stateLabel = "Durchschnittliche Verfügbarkeit ";
        }
        else if (targetResult === "charging") {
            stateLabel = "Durchschnittliche Auslastung ";
        }
        else if (targetResult === "outoforder") {
            stateLabel = "Durchschnittlich außer Betrieb ";
        }

        $(".ladesaeulen .day").text(day);

        label = day === undefined || targetResult === undefined || stateLabel === undefined
            ? "" : stateLabel + day + "s";

        return label;
    },

    // setter-functions
    setRequestUrl: function (value) {
        this.set("requestUrl", value);
    },

    setVersionUrl: function (value) {
        this.set("versionUrl", value);
    },

    setDataStreamIds: function (value) {
        this.set("dataStreamIds", value);
    },

    setGfiParams: function (value) {
        this.set("gfiParams", value);
    },

    setUTC: function (value) {
        this.set("utc", value);
    },

    setHeadTitleObject: function (value) {
        this.set("headTitleObject", value);
    },

    setTableheadArray: function (value) {
        this.set("tableheadArray", value);
    },

    setGfiProperties: function (value) {
        this.set("gfiProperties", value);
    },

    setGfiHeight: function (value) {
        this.set("gfiHeight", value);
    },

    setGfiWidth: function (value) {
        this.set("gfiWidth", value);
    },

    setTableheadIndicatorArray: function (value) {
        this.set("tableheadIndicatorArray", value);
    },

    setIndicatorPropertiesObj: function (value) {
        this.set("indicatorPropertiesObj", value);
    },

    setWeekday: function (value) {
        this.set("weekday", value);
    },

    setLastDate: function (value) {
        this.set("lastDate", value);
    },

    setDayIndex: function (value) {
        this.set("dayIndex", value);
    },

    setIndicatorGfiHeight: function (value) {
        this.set("indicatorGfiHeight", value);
    }

});

export default ElektroladesaeulenTheme;
