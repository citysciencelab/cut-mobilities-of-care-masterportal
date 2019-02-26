import Theme from "../model";
import * as moment from "moment";

const ElektroladesaeulenTheme = Theme.extend({

    initialize: function () {
        var channel = Radio.channel("elektroladesaeulenTheme");

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
        var gfiContent = this.get("gfiContent"),
            gfiProperties = this.splitProperties(gfiContent[0]),
            allProperties = this.splitProperties(gfiContent.allProperties),
            dataStreamIds = allProperties.dataStreamId,
            requestURL = allProperties.requestURL[0],
            versionURL = allProperties.versionURL[0],
            gfiParams = this.get("feature").get("gfiParams"),
            utc = this.get("feature").get("utc"),
            headTitleObject = this.createGfiHeadingChargingStation(allProperties),
            tableheadArray = this.createGfiTableHeadingChargingStation(allProperties);

        gfiProperties = this.changeStateToGerman(gfiProperties);

        // set Properties
        this.setRequestURL(requestURL);
        this.setVersionURL(versionURL);
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
        var gfiContent,
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
            lastDay = _.isUndefined(this.get("lastDate")) ? "" : moment(this.get("lastDate")).format("YYYY-MM-DD");
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
        var value;

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
     * @param  {Object} properties - from chargingstation
     * @return {Object} propertiesObj
     */
    splitProperties: function (properties) {
        var propertiesObj = {};

        _.each(properties, function (value, key) {
            if (value === "|" || _.contains(value, "|")) {
                propertiesObj[key] = String(value).split("|");
            }
            else if (_.isObject(value) && !_.isArray(value)) {
                propertiesObj[key] = [""];
            }
            else {
                propertiesObj[key] = [String(value)];
            }

            // remove blanks
            _.each(propertiesObj[key], function (str, index) {
                propertiesObj[key][index] = str.trim();
            });
        });

        return propertiesObj;
    },

    /**
     * creates the heading for the gfi of charging stations
     * @param  {Object} allProperties - from chargingstation
     * @return {Object} headTitleObject
     */
    createGfiHeadingChargingStation: function (allProperties) {
        var headTitleObject = {};

        headTitleObject.StandortID = _.has(allProperties, "chargings_station_nr") ? String(allProperties.chargings_station_nr[0]) : "";
        headTitleObject.Adresse = _.has(allProperties, "chargings_station_nr") && _.has(allProperties, "postal_code") && _.has(allProperties, "city")
            ? allProperties.location_name[0] + ", " + allProperties.postal_code[0] + " " + allProperties.city[0] : "";
        headTitleObject.Eigentümer = _.has(allProperties, "owner") ? allProperties.owner[0] : "";

        return headTitleObject;
    },

    /**
     * creates the heading for the table in the gfi of charging stations
     * @param  {Object} allProperties - from chargingstation
     * @return {Array} tableheadArray
     */
    createGfiTableHeadingChargingStation: function (allProperties) {
        var stationNumbers = _.has(allProperties, "sms_no_charging_station") ? allProperties.sms_no_charging_station : [],
            tableheadArray = [];

        _.each(stationNumbers, function (num) {
            tableheadArray.push("Ladepunkt: " + num);
        });

        return tableheadArray;
    },

    /**
     * changes the states from englisch to german
     * @param  {Object} gfiProperties - with english state
     * @return {Object} gfiProperties - with german state
     */
    changeStateToGerman: function (gfiProperties) {
        var translateObj = {
                available: "Frei",
                charging: "Belegt",
                outoforder: "Außer Betrieb"
            },
            gfiPropertiesGerman = !_.isUndefined(gfiProperties) ? gfiProperties : {};

        _.each(gfiPropertiesGerman.Zustand, function (state, index) {
            if (_.contains(_.keys(translateObj), state.toLowerCase())) {
                gfiPropertiesGerman.Zustand[index] = translateObj[state];
            }
            else {
                gfiPropertiesGerman.Zustand[index] = "";
            }

        });

        return gfiPropertiesGerman;
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
        var historicalData,
            query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc",
            requestURL = this.get("requestURL"),
            versionURL = this.get("versionURL"),
            completeURL;

        // add gfiParams an filter to query
        query = this.addGfiParams(query, gfiParams);
        query = this.addFilter(query, dataStreamIds);

        completeURL = this.buildRequestFromQuery(query, requestURL, versionURL);
        historicalData = this.sendRequest(completeURL, async);

        // if with one request not all data can be fetched
        _.each(historicalData, function (data) {
            var observationsID = data["@iot.id"],
                observationsCount = data["Observations@iot.count"],
                observationsLength = data.Observations.length,
                skipCompleteURL,
                skipHistoricalData;

            // this.moreHistoricalData(data, observationsCount, completeURL, observationsLength, observationsID, async);
            while (observationsCount > data.Observations.length) {
                skipCompleteURL = completeURL.split(")")[0] + ";$skip=" + observationsLength + ")&$filter=@iot.id eq'" + observationsID + "'";
                skipHistoricalData = this.sendRequest(skipCompleteURL, async);

                data.Observations.push.apply(data.Observations, skipHistoricalData[0].Observations);
            }
        }, this);

        return historicalData;
    },


    /**
     * adds filter to a given query
     * @param {String} query - filter load observations
     * @param {String} dataStreamIds - from feature
     * @return {Object[]} workingQuery
     */
    addFilter: function (query, dataStreamIds) {
        var workingQuery = query + ")&$filter=";

        _.each(dataStreamIds, function (id, index) {
            var dataStreamIdLen = dataStreamIds.length - 1;

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
     * @param {Object[]} gfiParams - attributes that specify the historical data period
     * @return {String} extended query
     */
    addGfiParams: function (query, gfiParams) {
        var startDate = _.has(gfiParams, "startDate") ? gfiParams.startDate : undefined,
            endDate = _.has(gfiParams, "endDate") ? gfiParams.endDate : undefined,
            periodTime = _.has(gfiParams, "periodTime") ? gfiParams.periodTime : undefined,
            periodUnit = _.has(gfiParams, "periodUnit") ? gfiParams.periodUnit : undefined,
            workingQuery = _.isUndefined(query) ? "" : query,
            lastDate,
            time,
            translateUnit,
            unit;

        // handle Dates
        if (!_.isUndefined(startDate)) {
            lastDate = moment(startDate, "DD.MM.YYYY");
            // request 3 more weeks to find the latest status
            time = moment(startDate, "DD.MM.YYYY").subtract(3, "weeks").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
            workingQuery = workingQuery + ";$filter=phenomenonTime gt " + time;

            if (!_.isUndefined(endDate)) {
                endDate = moment(endDate, "DD.MM.YYYY").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
                workingQuery = workingQuery + " and phenomenonTime lt " + endDate;
            }
        }
        // handle period
        else if (!_.isUndefined(periodTime) && !_.isUndefined(periodUnit)) {
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
     * @param  {String} requestURL - url to service
     * @param  {String} versionURL - version of the service
     * @return {String} complete URL
     */
    buildRequestFromQuery: function (query, requestURL, versionURL) {
        var completeURL;

        if (_.isUndefined(query || requestURL) || _.isNaN(parseFloat(versionURL, 10))) {
            completeURL = "";
        }
        else {
            completeURL = requestURL + "/"
                + "v" + versionURL + "/"
                + "Datastreams" + query;
        }

        return completeURL;
    },

    /**
     * returns the historicalData by Ajax-Request
     * @param  {String} requestURLHistoricaldata - url with query
     * @param  {Boolean} async - state fo ajax-request
     * @return {Object[]} historicalData
     */
    sendRequest: function (requestURLHistoricaldata, async) {
        var response;

        $.ajax({
            url: requestURLHistoricaldata,
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
     * @param  {Array} dataArray - that contains data from the features
     * @return {Array} workingArray - without doublicates
     */
    dataCleaning: function (dataArray) {
        var workingArray = _.isUndefined(dataArray) ? [] : dataArray;

        _.each(workingArray, function (loadingPoint) {
            var observations = loadingPoint.Observations,
                lastTime = 0,
                lastState = "",
                indexArray = [];

            _.each(observations, function (data, index) {
                var time = moment(data.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss"),
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
            _.each(indexArray.reverse(), function (element) {
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
        var historicalDataThisTimeZone,
            historicalDataWithIndex,
            dataByWeekday,
            utc = _.isUndefined(this.get("utc")) ? "+1" : this.get("utc");

        // Check if data is available
        if (this.checkObservationsNotEmpty(historicalData)) {
            historicalDataThisTimeZone = this.changeTimeZone(historicalData, utc);
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
     * @param  {Object[]} historicalData - data from feature
     * @return {Boolean} boolean
     */
    checkObservationsNotEmpty: function (historicalData) {
        var boolean = false;

        _.each(historicalData, function (data) {
            if (!_.isEmpty(data.Observations)) {
                boolean = true;
            }
        });

        return boolean;
    },


    /**
     * change the timzone for the historicalData
     * @param  {Object[]} historicalData - data from feature
     * @param  {Object[]} utc - timezone
     * @return {Object[]} data
     */
    changeTimeZone: function (historicalData, utc) {
        var data = _.isUndefined(historicalData) ? [] : historicalData;

        _.each(data, function (loadingPointData) {
            _.each(loadingPointData.Observations, function (obs) {
                var phenomenonTime = obs.phenomenonTime,
                    utcAlgebraicSign = utc.substring(0, 1),
                    utcSub,
                    utcNumber,
                    utcString = _.isUndefined(utc) ? "+1" : utc;

                if (utcString.length === 2) {
                    // check for winter- and summertime
                    utcSub = parseInt(utcString.substring(1, 2), 10);
                    utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
                    utcNumber = "0" + utcSub + "00";
                }
                else if (utcString.length > 2) {
                    utcSub = parseInt(utcString.substring(1, 3), 10);
                    utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
                    utcNumber = utc.substring(1, 3) + "00";
                }

                obs.phenomenonTime = moment(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("YYYY-MM-DDTHH:mm:ss");

            });
        });

        return data;
    },

    /**
     * add an index to the historicalData
     * @param {Object[]} historicalData -  - data from feature
     * @return {Object[]} data
     */
    addIndex: function (historicalData) {
        var data = _.isUndefined(historicalData) ? [] : historicalData;

        _.each(data, function (loadingPointData) {
            _.each(loadingPointData.Observations, function (obs, index) {
                obs.index = index;
            });
        });

        return data;
    },

    /**
     * divides the day into 7 days of the week
     * and generate an observation for every day at 0 o'clock
     * @param  {Array} historicalDataWithIndex - from features
     * @param  {Date} lastDay - the day on which the evaluation of the data should end
     * @param  {Date} endDay - the date at which the evaluation should end
     * @return {Array} weekArray
     */
    divideDataByWeekday: function (historicalDataWithIndex, lastDay, endDay) {
        var weekArray = [
            [], [], [], [], [], [], []
        ];

        _.each(historicalDataWithIndex, function (historicalData) {
            var observations = _.has(historicalData, "Observations") ? historicalData.Observations : [],
                arrayIndex = 0,
                booleanLoop = true,
                thisLastDay,
                actualDay = _.isUndefined(endDay) ? moment().format("YYYY-MM-DD") : endDay;

            if (!_.isEmpty(observations)) {
                thisLastDay = _.isUndefined(lastDay) || lastDay === "" ? moment(observations[observations.length - 1].phenomenonTime).format("YYYY-MM-DD") : lastDay;
                weekArray[arrayIndex].push([]);
            }

            _.each(observations, function (data) {
                var phenomenonDay = moment(data.phenomenonTime).format("YYYY-MM-DD"),
                    zeroTime,
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
        var width = this.get("gfiWidth"),
            height = this.get("gfiHeight"),
            dataByWeekday = this.get("weekday"),
            dataPerHour,
            processedData,
            graphConfig,
            day = moment().subtract(index, "days").format("dddd");

        // need to toggle weekdays
        this.setDayIndex(index);
        // set an error message if the values of processedData are all 0
        if (_.isEmpty(dataByWeekday)) {
            this.drawErrorMessage(graphTag, width, height, index);
            return;
        }
        // process data for day with given index (0 = today)
        dataPerHour = this.calculateWorkloadPerDayPerHour(dataByWeekday[index], targetResult);
        processedData = this.calculateSumAndArithmeticMean(dataPerHour);

        // set an error message if the values of processedData are all 0
        if (_.isUndefined(this.checkValue(processedData, "mean"))) {
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
        var today = moment().subtract(index, "days").format("dddd");

        $(".ladesaeulen .day").text(today);
        $("<div class='noData' style='height: " + height + "px; width: " + width + "px;'>")
            .appendTo("div" + graphTag)
            .text("Zurzeit keine Informationen!");
    },

    /**
     * calculate workload for every day
     * the workload is divided into 24 hours
     * @param  {Array} dataByWeekday - historical data sorted by weekday
     * @param  {String} targetResult - result to draw
     * @return {Array} allDataArray
     */
    calculateWorkloadPerDayPerHour: function (dataByWeekday, targetResult) {
        var allDataArray = [];

        _.each(dataByWeekday, function (dayData) {
            var zeroTime = moment(moment(dayData[0].phenomenonTime).format("YYYY-MM-DD")).format("YYYY-MM-DDTHH:mm:ss"),
                firstTimeDayData = moment(dayData[0].phenomenonTime).format("YYYY-MM-DDTHH:mm:ss"),
                emptyDayObj = this.createInitialDayPerHour(),
                dayObj;

            if (firstTimeDayData !== zeroTime && _.isArray(dayData)) {
                dayData.reverse();
            }

            dayObj = this.calculateWorkloadforOneDay(emptyDayObj, dayData, targetResult);
            allDataArray.push(dayObj);
        }, this);

        return allDataArray;
    },

    /**
     * create an object with 24 pairs, which represents 24 hours for one day
     * the values are by initialize 0
     * @return {Object} dayObj
     */
    createInitialDayPerHour: function () {
        var dayObj = {},
            i;

        for (i = 0; i < 24; i++) {
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
        var dataFromDay = _.isUndefined(dayData) ? [] : dayData,
            actualState = _.has(dataFromDay[0], "result") ? dataFromDay[0].result : "",
            actualStateAsNumber = targetResult === actualState ? 1 : 0,
            startDate = _.has(dataFromDay[0], "phenomenonTime") ? moment(dataFromDay[0].phenomenonTime).format("YYYY-MM-DD") : "",
            dayObj = _.isUndefined(emptyDayObj) ? {} : emptyDayObj;

        _.each(dayObj, function (value, key) {
            var i = parseFloat(key, 10),
                actualTimeStep = moment(startDate).add(i, "hour").format("YYYY-MM-DDTHH:mm:ss"),
                nextTimeStep = moment(startDate).add(i + 1, "hour").format("YYYY-MM-DDTHH:mm:ss"),
                dataByActualTimeStep = this.filterDataByActualTimeStep(dataFromDay, actualTimeStep, nextTimeStep);

            // if the requested period is in the future
            if (moment(nextTimeStep).toDate().getTime() > moment().toDate().getTime()) {
                dayObj[i] = undefined;
            }
            else if (_.isEmpty(dataByActualTimeStep)) {
                dayObj[i] = actualStateAsNumber;
            }
            else {
                dayObj[i] = this.calculateOneHour(dataByActualTimeStep, actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult);
                actualState = _.last(dataByActualTimeStep).result;
                actualStateAsNumber = targetResult === actualState ? 1 : 0;
            }
        }, this);

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
            var dataToCheck = _.has(data, "phenomenonTime") ? moment(data.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss") : "";

            return dataToCheck >= actualTimeStep && dataToCheck < nextTimeStep;
        });
    },

    /**
     * calculates the workload for the current hour
     * time calculations in milliseconds
     * @param  {Array} dataByActualTimeStep - within an hour
     * @param  {String} actualState - status of the last observation
     * @param  {Number} actualStateAsNumber - state as number 0 or 1
     * @param  {String} actualTimeStep - startTime
     * @param  {String} nextTimeStep - endTime
     * @param  {String} targetResult - result to draw
     * @return {Number} workload
     */
    calculateOneHour: function (dataByActualTimeStep, actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult) {
        var actualPhenomenonTime = moment(actualTimeStep).toDate().getTime(),
            endTime = moment(nextTimeStep).toDate().getTime(),
            timeDiff = 0,
            currentState = actualState,
            currentStateAsNumber = actualStateAsNumber,
            betweenRes;

        _.each(dataByActualTimeStep, function (data) {
            var state = _.has(data, "result") ? data.result : currentState,
                phenomenonTime,
                res;

            if (state !== currentState) {
                phenomenonTime = _.has(data, "phenomenonTime") ? moment(data.phenomenonTime).toDate().getTime() : "";

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
        timeDiff = _.isNaN(betweenRes) ? timeDiff : timeDiff + betweenRes;

        // result in the unit hour, rounded to 3 decimal places
        return Math.round(timeDiff / 3600) / 1000;
    },

    /**
     * calculates the arithemtic Meaning for all datas
     * @param  {Array} dataPerHour - data for every day, according to targetresult
     * @return {Array} dayMeanArray
     */
    calculateSumAndArithmeticMean: function (dataPerHour) {
        var dayLength = 24,
            dayMeanArray = [],
            i,
            sum,
            mean,
            arrayPerHour;

        for (i = 0; i <= dayLength; i++) {
            // initialize
            sum = 0;
            mean = 0;
            arrayPerHour = this.arrayPerHour(dataPerHour, i);

            if (_.isEmpty(arrayPerHour)) {
                break;
            }
            // remove all undefined data
            arrayPerHour = arrayPerHour.filter(function (value) {
                return !_.isUndefined(value);
            });

            // calculate sum of the array with values for one hour
            sum = _.reduce(arrayPerHour, function (memo, value) {
                return memo + value;
            });

            // calculate mean of the array with values for one hour
            mean = sum / arrayPerHour.length;

            if (_.isNaN(mean)) {
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
     * @param  {Array} dataPerHour - data for every day, according to targetresult
     * @param  {Number} position - one hour
     * @return {Array} arrayPerHour
     */
    arrayPerHour: function (dataPerHour, position) {
        var arrayPerHour = [];

        _.each(dataPerHour, function (day) {
            var positionData = parseFloat(_.pick(day, String(position))[position], 10);

            if (!_.isUndefined(positionData) && !_.isNaN(positionData)) {
                arrayPerHour.push(positionData);
            }
        });

        return arrayPerHour;
    },

    /**
     * checks if processdData is existing
     * if no data is found, undefined will be delivered
     * @param  {Array} processedData - data with mean
     * @param  {Array} value - the key is searched
     * @return {Object} first data that was found
     */
    checkValue: function (processedData, value) {
        return _.find(processedData, function (data) {
            return data[value] > 0;
        });
    },


    /**
     * creates the caption for the graph
     * @param  {String} day - the day that is drawing
     * @param  {String} targetResult - result to draw
     * @return {String} label
     */
    createXAxisLabel: function (day, targetResult) {
        var stateLabel,
            label;

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

        label = _.isUndefined(day) || _.isUndefined(targetResult) || _.isUndefined(stateLabel)
            ? "" : stateLabel + day + "s";

        return label;
    },

    // setter-functions
    setRequestURL: function (value) {
        this.set("requestURL", value);
    },

    setVersionURL: function (value) {
        this.set("versionURL", value);
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
