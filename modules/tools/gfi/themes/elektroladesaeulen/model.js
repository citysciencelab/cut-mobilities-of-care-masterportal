define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        d3 = require("d3"),
        ElektroladesaeulenTheme,
        moment = require("moment");

    ElektroladesaeulenTheme = Theme.extend({

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseProperties,
                "change:isVisible": this.loadData
            });
        },

        /**
         * generates the properties to be displayed when creating the gfi
         */
        parseProperties: function () {
            var gfiContent = this.get("gfiContent"),
                gfiProperties = this.splitProperties(gfiContent[0]),
                allProperties = this.splitProperties(gfiContent.allProperties),
                dataStreamIds = allProperties.dataStreamId,
                requestURL = allProperties.requestURL,
                versionURL = allProperties.versionURL,
                gfiParams = this.get("feature").get("gfiParams"),
                indicatorDataArray,
                headTitleObject = this.createGfiHeadingChargingStation(allProperties),
                tableheadArray = this.createGfiTableHeadingChargingStation(allProperties);

            gfiProperties = this.changeStateToGerman(gfiProperties);

            // set Properties
            this.set("requestURL", requestURL);
            this.set("versionURL", versionURL);
            this.set("dataStreamIds", dataStreamIds);
            this.set("gfiParams", gfiParams);
            this.set("headTitleObject", headTitleObject);
            this.set("tableheadArray", tableheadArray);
            this.set("gfiProperties", gfiProperties);
        },

        /**
         * processes the historical data and the indicators as soon as the gfi is visible
         */
        loadData: function () {
            if (this.get("isVisible") === true) {
                var gfiContent = this.get("gfiContent"),
                    allProperties = this.splitProperties(gfiContent.allProperties),
                    dataStreamIds = allProperties.dataStreamId,
                    gfiParams = this.get("gfiParams"),
                    historicalData = this.createHistoricalData(false, dataStreamIds, gfiParams),
                    historicalDataClean = this.dataCleaning(historicalData),
                    indicatorChargingData = this.createIndicatorCharging(false, dataStreamIds),
                    indicatorChargingDataClean = this.dataCleaningChargingIndicator(indicatorChargingData),
                    processedIndicatorCharging = this.processIndicatorCharging(indicatorChargingDataClean),
                    tableheadIndicatorArray = this.createIndicatorHead(processedIndicatorCharging),
                    indicatorPropertiesObj = this.processChargingIndicator(processedIndicatorCharging),
                    targetResults = ["available", "charging", "outoforder"];

                // set indicators
                this.set("tableheadIndicatorArray", tableheadIndicatorArray);
                this.set("indicatorPropertiesObj", indicatorPropertiesObj);

                // start processing historicalData
                _.each(targetResults, function (targetResult) {
                    var dataByWeekday = this.processDataForAllWeekdays(targetResult, historicalDataClean);

                    this.set("weekday" + targetResult, dataByWeekday);
                }, this);
            }
        },

        /**
         * split properties by pipe (|)
         * @param  {Object} properties
         * @return {Object}
         */
        splitProperties: function (properties) {
            var propertiesObj = {};

            _.each(properties, function (value, key) {
                if (value === "|") {
                    propertiesObj[key] = String(value).split("|");
                }
                else if (_.contains(value, "|")) {
                    propertiesObj[key] = String(value).split(" | ");
                }
                else {
                    propertiesObj[key] = [String(value)];
                }
            });

            return propertiesObj;
        },

        /**
         * creates the heading for the gfi of charging stations
         * @param  {Object} allProperties
         * @return {Object}
         */
        createGfiHeadingChargingStation: function (allProperties) {
            var headTitleObject = {};

            if (this.attributes.name.indexOf("Elektro") !== -1) {
                headTitleObject.StandortID = allProperties.chargings_station_nr[0];
                headTitleObject.Adresse = allProperties.location_name[0] + ", " +
                    allProperties.postal_code[0] + " " + allProperties.city[0];
                headTitleObject.Eigentümer = allProperties.owner[0];
            }

            return headTitleObject;
        },

        /**
         * creates the heading for the table in the gfi of charging stations
         * @param  {Object} allProperties
         * @return {Array}
         */
        createGfiTableHeadingChargingStation: function (allProperties) {
            var stationNumbers = allProperties.sms_no_charging_station,
                tableheadArray = [];

            if (this.attributes.name.indexOf("Elektro") !== -1) {
                _.each(stationNumbers, function (num) {
                    tableheadArray.push("Ladepunkt: " + num);
                });
            }

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
            };

            _.each(gfiProperties.Zustand, function (state, index) {
                if (_.contains(_.keys(translateObj), state)) {
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
         * @param  {boolean} async - mode for ajax
         * @return {[Object]}
         */
        createHistoricalData: function (async, dataStreamIds, gfiParams) {
            var historicalData = [],
                query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc",
                historicalData,
                requestURL;

            // add gfiParams to query
            if (!_.isUndefined(gfiParams)) {
                query = this.addGfiParams(query, gfiParams);
            }

            query = query + ")&$filter=";
            _.each(dataStreamIds, function (id, index) {
                query = query + "@iot.id eq'" + id + "'";

                if (index !== (dataStreamIds.length - 1)) {
                    query = query + "or ";
                }
            });

            requestURL = this.buildRequestFromQuery(query);
            historicalData = this.sendRequest(requestURL, async);

            // if with one request not all data can be fetched
            _.each(historicalData, function (data) {
                var observationsID = data["@iot.id"],
                    observationsCount = data["Observations@iot.count"],
                    observationsLength = data.Observations.length;

                if (observationsCount > observationsLength) {
                    for (var i = observationsLength; i < observationsCount; i += observationsLength) {
                        var skipRequestURL = requestURL.split(")")[0] + ";$skip=" + observationsLength + ")&$filter=@iot.id eq'" + observationsID + "'",
                            skipHistoricalData = this.sendRequest(skipRequestURL, async);

                        data.Observations.push.apply(data.Observations, skipHistoricalData[0].Observations);
                    }
                }

            }, this);

            return historicalData;
        },

        /**
         * adds time params to query by given gfiParams
         * @param {String} query
         * @param {[Object]} gfiParams
         * @return {String} extended query
         */
        addGfiParams: function (query, gfiParams) {
            var startDate = gfiParams.startDate,
                endDate = gfiParams.endDate,
                periodTime = gfiParams.periodTime,
                periodUnit = gfiParams.periodUnit,
                lastDate = moment(startDate, "DD.MM.YYYY"),
                time;

            // handle Dates
            if (!_.isUndefined(startDate)) {
                // request 3 more weeks to find the latest status
                time = moment(startDate, "DD.MM.YYYY").subtract(3, "weeks").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
                query = query + ";$filter=phenomenonTime gt " + time;

                if (!_.isUndefined(endDate)) {
                    endDate = moment(endDate, "DD.MM.YYYY").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
                    query = query + " and phenomenonTime lt " + endDate;
                }
            }
            // handle period
            else if (!_.isUndefined(periodTime) && !_.isUndefined(periodUnit)) {
                var translateUnit = {
                    Jahr: "years",
                    Monat: "months",
                    Woche: "weeks",
                    Tag: "days",
                    Jahre: "years",
                    Monate: "months",
                    Wochen: "weeks",
                    Tage: "days"
                    },
                    unit = translateUnit[periodUnit],
                    // request 3 more weeks to find the latest status
                    time = moment().subtract(periodTime, unit).subtract(3, "weeks").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";

                query = query + ";$filter=phenomenonTime gt " + time;
            }

            // necessary for processing historical data
            this.set("lastDate", lastDate);

            return query;
        },

        /**
         * create the request with given query for one Datastream
         * @param  {String} requestURL
         * @param  {String} versionURL - version of the service
         * @param  {[type]} id - of the dataStream
         * @return {String} complete URL
         */
        buildRequestFromQuery: function (query) {
            var requestURL = this.get("requestURL"),
                versionURL = this.get("versionURL");

            return historicalDataURL = requestURL + "/" +
                "v" + versionURL + "/" +
                "Datastreams" + query;
        },

         /**
         * returns the historicalData by Ajax-Request
         * @param  {String} requestURLHistoricaldata - url with query
         * @param  {boolean} async
         * @return {[Object]} historicalData
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
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Es ist ein unerwarteter Fehler beim Anfordern der historischen Daten aufgetreten!</strong>",
                        kategorie: "alert-danger"
                    });
                }
            });

           return response;
        },

        /**
         * gets the data for the indicator charging
         * @param  {boolean} async
         * @param  {Array} dataStreamIds
         * @return {[Object]}
         */
        createIndicatorCharging: function (async, dataStreamIds) {
            var historicalData = [],
                minYear = 2017,
                maxYear = moment().format("YYYY"),
                dataArray = [],
                requestURL;

                for (var i = minYear; i <= maxYear; i++) {
                    var array = [],
                        data,
                        dataObj = {},
                        query = "?$expand=Observations($filter=result%20eq%27charging%27and%20year(phenomenonTime)%20eq%20" + i + ")&$filter=";

                    _.each(dataStreamIds, function (id, index) {
                        query = query + "@iot.id eq'" + id + "'";

                        if (index !== (dataStreamIds.length - 1)) {
                            query = query + "or ";
                        }
                    });

                    // build and send request
                    requestURL = this.buildRequestFromQuery(query);
                    data = this.sendRequest(requestURL, async);
                    data.year = i;

                    // if with one request not all data can be fetched
                    _.each(data, function (dat) {
                        var observationsID = dat["@iot.id"],
                            observationsCount = dat["Observations@iot.count"],
                            observationsLength = dat.Observations.length;

                        if (observationsCount > observationsLength) {
                            for (var i = observationsLength; i < observationsCount; i += observationsLength) {
                                var skipRequestURL = requestURL.split(")")[0] + ")" + requestURL.split(")")[1] + ";$skip=" + observationsLength + ")&$filter=@iot.id eq'" + observationsID + "'",
                                    skipData = this.sendRequest(skipRequestURL, async);

                                dat.Observations.push.apply(dat.Observations, skipData[0].Observations);
                            }
                        }
                    }, this);

                    dataArray.push(data);
                }

            return dataArray;
        },

        dataCleaningChargingIndicator: function (dataArray) {
            _.each(dataArray, function (data) {
                data = this.dataCleaning(data);
            }, this);

            return dataArray;
        },

        dataCleaning: function (dataArray) {
            _.each(dataArray, function (loadingPoint) {
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
                    else if (Math.abs((moment(lastTime).diff(time))) < 1000 && state === lastState) {
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

            return dataArray;
        },

        processIndicatorCharging: function (dataArray) {
            var processedDataArray = [];

            _.each(dataArray, function (loadingPoint) {
                var dataObj = {},
                    array = [];

                _.each(loadingPoint, function (data) {
                    array.push(data.Observations.length);
                });

                dataObj.loadingCount = array;
                dataObj.year = loadingPoint.year;

                processedDataArray.push(dataObj);
            });

            return processedDataArray;
        },

        /**
         * creates a header from the indicator data that is displayed in the table
         * @param  {[Object]} indicatorDataArray
         * @return {Array} tableheadIndicatorArray - with years as head
         */
        createIndicatorHead: function (indicatorDataArray) {
            var tableheadIndicatorArray = [];

            _.each(indicatorDataArray, function (indicator) {
                tableheadIndicatorArray.push(indicator.year);
            });

            return tableheadIndicatorArray;
        },

        /**
         * generates an object from the indicatorData
         * @param  {[Object]} indicatorDataArray
         * @return {[Object]} indicatorPropertiesObj - the values are stored as an array
         */
        processChargingIndicator: function (indicatorDataArray) {
            var indicatorPropertiesArray = [],
                indicatorPropertiesObj = {};

            // add indiocator to gfiProperties
            _.each(indicatorDataArray, function (indicator) {
                var erg = 0;

                _.each(indicator.loadingCount, function (value) {
                    erg = erg + value;
                });

                indicatorPropertiesArray.push(erg);
            });

            indicatorPropertiesObj["Anzahl der Ladungen"] = indicatorPropertiesArray;

            return indicatorPropertiesObj;
        },

// *************************************************************
// ***** Processing data                                   *****
// *************************************************************
        processDataForAllWeekdays: function (targetResult, historicalData) {
            var historicalDataThisTimeZone,
                historicalDataWithIndex,
                dataByWeekday,
                dataPerHour,
                processedData,
                graphConfig;

            if (!this.checkObservationsEmpty(historicalData)) {
                historicalDataThisTimeZone = this.changeTimeZone(historicalData);
                historicalDataWithIndex = this.addIndex(historicalDataThisTimeZone);
                dataByWeekday = this.divideDataByWeekday(historicalDataWithIndex);
            }
            else {
                dataByWeekday = [];
            }

            return dataByWeekday;
        },

        /**
         * checks if there are any observations
         * @param  {[Object]} historicalData
         * @return {boolean}
         */
        checkObservationsEmpty: function (historicalData) {
            var boolean = false;

            _.each(historicalData, function (data) {
                (_.isEmpty(data.Observations)) ? boolean = true : boolean = false;
            });

            return boolean;
        },


        /**
         * change the timzone for the historicalData
         * @param  {[Object]} historicalData
         * @return {[Object]}
         */
        changeTimeZone: function (historicalData) {
            _.each(historicalData, function (loadingPointData) {
                _.each(loadingPointData.Observations, function (obs) {
                    obs.phenomenonTime = moment(obs.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss");
                });
            });

            return historicalData;
        },

        /**
         * add an index to the historicalData
         * @param {[object]} historicalData
         */
        addIndex: function (historicalData) {
            _.each(historicalData, function (loadingPointData) {
                _.each(loadingPointData.Observations, function (obs, index) {
                    obs.index = index;
                });
            });

            return historicalData;
        },

        divideDataByWeekday: function (historicalDataWithIndex) {
            var weekArray = [[], [], [], [], [], [], []],
                lastDay = moment(this.get("lastDate")).format("YYYY-MM-DD");

            _.each(historicalDataWithIndex, function (historicalData) {
                var observations = historicalData.Observations,
                    actualDay = moment().format("YYYY-MM-DD"),
                    // lastDay = moment(observations[(observations).length - 1].phenomenonTime).format("YYYY-MM-DD"),
                    arrayIndex = 0,
                    booleanLoop = true;

                weekArray[arrayIndex].push([]);

                _.each(observations, function (data, index) {
                    var phenomenonDay = moment(data.phenomenonTime).format("YYYY-MM-DD"),
                        zeroTime,
                        zeroResult,
                        weekArrayIndexLength;

                    // solange bis data verarbeitet wurde
                    while (booleanLoop) {
                        weekArrayIndexLength = weekArray[arrayIndex].length - 1;

                        // wenn das letzte Datum erreicht ist, dann wird die Schleife nicht mehr benötigt
                         if (moment(actualDay) < moment(lastDay)) {
                            booleanLoop = false;
                            weekArray[arrayIndex].pop();
                            break;
                        }
                        // wenn Observationstag = aktueller Tag, dann hinzufügen
                        else if (phenomenonDay === actualDay) {
                            weekArray[arrayIndex][weekArrayIndexLength].push(data);
                            break; // data wurde verarbeitet
                        }
                        // object mit 0 Uhr und dem status des aktuellen Tages hinzufügen
                        else {
                            zeroTime = moment(actualDay).format("YYYY-MM-DDTHH:mm:ss");
                            zeroResult = data.result;
                            weekArray[arrayIndex][weekArrayIndexLength].push({phenomenonTime: zeroTime, result: zeroResult});

                            // Danach aktuellen Tag auf vorherigen Tag und ArrayIndex auf nächstes Array setzen
                            actualDay = moment(actualDay).subtract(1, "days").format("YYYY-MM-DD");
                            (arrayIndex >= 6) ? arrayIndex = 0 : arrayIndex++;
                            weekArray[arrayIndex].push([]);
                        }
                    }
                });
            });

            return weekArray;
        },

        triggerToBarGraph: function (targetResult, graphTag, index) {
            var width = this.get("gfiWidth"),
                height = this.get("gfiHeight"),
                dataByWeekday = this.get("weekday" + targetResult),
                dataPerHour,
                processedData;

            // set an error message if the values of processedData are all 0
            if (_.isEmpty(dataByWeekday)) {
                this.drawErrorMessage(graphTag, width, height);
                return;
            }

            // need to toggle weekdays
            this.set("dayIndex", index);

            // process data for day with given index (0 = today)
            dataPerHour = this.calculateWorkloadPerDayPerHour(dataByWeekday[index], targetResult);
            processedData = this.calculateArithmeticMean(dataPerHour);

            // set an error message if the values of processedData are all 0
            if (_.isUndefined(this.checkValue(processedData))) {
                this.drawErrorMessage(graphTag, width, height);
                return;
            }

            // config for style the graph
            graphConfig = {
                graphType: "BarGraph",
                selector: graphTag,
                width: width,
                height: height - 5,
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
                    label: this.createXAxisLabel(index, targetResult),
                    offset: 10,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 12
                },
                xAttr: "hour",
                attrToShowArray: ["value"]
            };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },

        /**
         * message if data is not evaluable or not existing
         * @param  {String} graphTag
         * @param  {number} width
         * @param  {number} height
         */
        drawErrorMessage: function (graphTag, width, height) {
            $("<div class='noData' style='height: " + height + "px; width: " + width + "px;'>")
                    .appendTo("div" + graphTag)
                    .text("Zur Zeit keine Informationen!");
        },

        /**
         * calculate workload for every day
         * the workload is divided into 24 hours
         * @param  {[[object]]} dataByWeekday
         * @param  {String} targetResult
         * @return {[[object]]}
         */
       calculateWorkloadPerDayPerHour: function (dataByWeekday, targetResult) {
            var allDataArray = [];

            _.each(dataByWeekday, function (dayData) {
                    var dayObj = this.createInitialDayPerHour(),
                        dayDataReverse = dayData.reverse();

                    dayObj = this.calculateWorkloadforOneDay(dayObj, dayDataReverse, targetResult);
                    allDataArray.push(dayObj);
                }, this);

            return allDataArray;
        },

        /**
         * create an object with 24 pairs, which represents 24 hours for one day
         * the values are by initialize 0
         * @return {object}
         */
        createInitialDayPerHour: function () {
            var dayObj = {};

            for (var i = 0; i < 24; i++) {
                dayObj[i] = 0;
            }

            return dayObj;
        },

        /**
         * calculate the workload for one day
         * @param  {object} dayObj
         * @param  {[object]} dayData
         * @param  {String} targetResult
         * @return {object}
         */
        calculateWorkloadforOneDay: function (dayObj, dayData, targetResult) {
            var actualState = dayData[0].result,
                actualStateAsNumber = (targetResult === actualState) ? 1 : 0,
                startDate = moment(dayData[0].phenomenonTime).format("YYYY-MM-DD");

            // Loop from 0 till 23 o'clock
            for (var i = 0; i < 24; i++) {
                var actualTimeStep = moment(startDate).add(i, "hour").format("YYYY-MM-DDTHH:mm:ss"),
                    nextTimeStep = moment(startDate).add((i + 1), "hour").format("YYYY-MM-DDTHH:mm:ss"),
                    dataByActualTimeStep = this.filterDataByActualTimeStep(dayData, actualTimeStep, nextTimeStep);

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
                    actualStateAsNumber = (targetResult === actualState) ? 1 : 0;
                }
            }

            return dayObj;
        },

        /**
         * filters out the objects of the current timestep
         * @param  {[object]} dayData
         * @param  {String} actualTimeStep
         * @param  {String} nextTimeStep
         * @return {[object]}
         */
        filterDataByActualTimeStep: function (dayData, actualTimeStep, nextTimeStep) {
            return _.filter(dayData, function (data) {
                var dataToCheck = moment(data.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss");

                return ((dataToCheck >= actualTimeStep) && (dataToCheck < nextTimeStep));
            });
        },

        /**
         * calculates the workload for the current hour
         * time calculations in milliseconds
         * @param  {[object]} dataByActualTimeStep
         * @param  {[String} actualState
         * @param  {number} actualStateAsNumber
         * @param  {String} actualTimeStep
         * @param  {String} nextTimeStep
         * @param  {String} targetResult
         * @return {number}
         */
        calculateOneHour: function (dataByActualTimeStep, actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult) {
            var actualPhenomenonTime = moment(actualTimeStep).toDate().getTime(),
                endTime = moment(nextTimeStep).toDate().getTime(),
                timeDiff = 0;

            _.each(dataByActualTimeStep, function (data) {
                var state = data.result;

                if (state === actualState) {
                    return;
                }
                else {
                    var phenomenonTime = moment(data.phenomenonTime).toDate().getTime();

                    timeDiff = timeDiff + (phenomenonTime - actualPhenomenonTime) * actualStateAsNumber;

                    // update the current status and time
                    actualPhenomenonTime = phenomenonTime;
                    actualState = state;
                    actualStateAsNumber = (targetResult === actualState) ? 1 : 0;
                }
            });

            // add last difference to next full hour
            timeDiff = timeDiff + (endTime - actualPhenomenonTime) * actualStateAsNumber;

            // result in the unit hour, rounded to 3 decimal places
            return Math.round((timeDiff / 3600)) / 1000;
        },

        /**
         * calculates the arithemtic Meaning for all datas
         * @param  {[[Object]]} dataPerHour
         * @return {Object}
         */
        calculateArithmeticMean: function (dataPerHour) {
            var dayLength = 24,
                dayMeanArray = [];

            for (var i = 0; i <= dayLength; i++) {
                var arrayPerHour = [],
                    mean,
                    obj = {};

                // returns an array which contains values at hour i
                _.each(dataPerHour, function (day) {
                    arrayPerHour.push(_.pick(day, String(i))[i]);
                });

                // remove all undefined data
                arrayPerHour = _.filter(arrayPerHour, function (value) {
                    return !_.isUndefined(value);
                });

                // calculate mean of the array with values for one hour
                mean = _.reduce(arrayPerHour, function (memo, value) {
                    return memo + value;
                }) / arrayPerHour.length;

                if (_.isNaN(mean)) {
                    mean = 0;
                }

                // push mean to dayMeanArrayn as object
                dayMeanArray.push({
                    hour: i,
                    value: Math.round(mean * 1000) / 1000
                });
            }

            return dayMeanArray;
        },

        /**
         * checks if processdData is existing
         * @param  {[type]} processedData [description]
         * @return {[type]}               [description]
         */
        checkValue: function (processedData) {
            return _.find(processedData, function (data) {
                return data.value > 0;
            });
        },

        /**
         * creates the caption for the graph
         * @param  {String} state
         * @return {String}
         */
        createXAxisLabel: function (index, state) {
            var today = moment().subtract(index, "days").format("dddd"),
                stateLabel;

            if (state === "available") {
                stateLabel = "Durchschnittliche Verfügbarkeit ";
            }
            else if (state === "charging") {
                stateLabel = "Durchschnittliche Auslastung ";
            }
            else if (state === "outoforder") {
                stateLabel = "Durchschnittlich außer Betrieb ";
            }

            return stateLabel + today + "s";
        }
    });

    return ElektroladesaeulenTheme;
});
