define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        d3 = require("d3"),
        ElektroladesaeulenTheme,
        moment = require("moment");

    ElektroladesaeulenTheme = Theme.extend({

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
            this.setRequestURL(requestURL);
            this.setVersionURL(versionURL);
            this.setDataStreamIds(dataStreamIds);
            this.setGfiParams(gfiParams);
            this.setHeadTitleObject(headTitleObject);
            this.setTableheadArray(tableheadArray);
            this.setGfiProperties(gfiProperties);
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
                    lastDay = moment(this.get("lastDate")).format("YYYY-MM-DD"),
                    dataByWeekday = this.processDataForAllWeekdays(historicalDataClean, lastDay);

                this.setDataStreamIds(dataStreamIds);
                this.setWeekday(dataByWeekday);
            }
        },

        /**
         * change gfi, if the tab-toogle "daten" ist active
         */
        changeData: function () {
            var value,
            index = this.get("dayIndex");

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
            var historicalData,
                query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc",
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
                lastDate,
                time;

            // handle Dates
            if (!_.isUndefined(startDate)) {
                lastDate = moment(startDate, "DD.MM.YYYY");
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

                lastDate = moment().subtract(periodTime, unit);
                query = query + ";$filter=phenomenonTime gt " + time;
            }

            // necessary for processing historical data
            this.setLastDate(lastDate);

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

// *************************************************************
// ***** create Indicators                                 *****
// *************************************************************
        /**
         * create various indicators
         * @param  {boolean} async
         */
        createIndicators: function (async) {
            var dataStreamIds = this.get("dataStreamIds"),
                indicatorChargingCount = this.createIndicatorChargingCount(async, dataStreamIds),
                indicatorChargingTime = this.createIndicatorChargingTime(async, dataStreamIds),
                indicatorTableHead = this.createIndicatorHead(indicatorChargingCount),
                indicatorChargingCountArray = this.processChargingIndicator(indicatorChargingCount),
                indicatordata = {};

            // combine data
            indicatordata["Gesamtanzahl der Ladungen"] = indicatorChargingCountArray;
            indicatordata["Gesamte Dauer der Ladungen"] = indicatorChargingTime;

            // set indicators
            this.setTableheadIndicatorArray(indicatorTableHead);
            this.setIndicatorPropertiesObj(indicatordata);
        },

        /**
         * creates indicator for total number of chargings per year
         * @param  {boolean} async
         * @param  {Array} dataStreamIds
         * @return {Array}
         */
        createIndicatorChargingCount: function (async, dataStreamIds) {
            var indicatorChargingCounterData = this.createIndicatorChargingCountData(async, dataStreamIds),
                indicatorChargingCounterDataClean = this.dataCleaningChargingIndicator(indicatorChargingCounterData),
                processedIndicatorChargingCounter = this.processIndicatorCharging(indicatorChargingCounterDataClean);

            return processedIndicatorChargingCounter;
        },

        /**
         * gets the data for the indicator charging
         * @param  {boolean} async
         * @param  {Array} dataStreamIds
         * @return {[Object]}
         */
        createIndicatorChargingCountData: function (async, dataStreamIds) {
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

        /**
         * starts cleaning data for every loadingpoint
         * @param  {Array} dataArray
         * @return {Array}
         */
        dataCleaningChargingIndicator: function (dataArray) {
            _.each(dataArray, function (data) {
                data = this.dataCleaning(data);
            }, this);

            return dataArray;
        },

        /**
         * removes doublicates
         * duplicates are records whose phenomenontime is less than 1000 milliseconds
         * @param  {Array} dataArray
         * @return {Array}
         */
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

        /**
         * Counts the number of observations
         * these only include the status: charging
         * @param  {Array} dataArray
         * @return {Array} processedDataArray - contains the total number per loadingpoint
         */
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

            return indicatorPropertiesArray;
        },

        /**
         * creates indicator for total operating time of chargings per year
         * @param  {boolean} async
         * @param  {Array} dataStreamIds
         * @return {Array} indicatorChargingTime - contains the times
         */
        createIndicatorChargingTime: function (async, dataStreamIds) {
            var indicatorChargingHourData = this.createDataIndicatorChargingHour(false, dataStreamIds),
                indicatorChargingHourDataClean = this.dataCleaning(indicatorChargingHourData),
                indicatorChargingHourDataByWeekday = this.processDataForAllWeekdays(indicatorChargingHourDataClean),
                minYear = 2017,
                maxYear = moment().format("YYYY"),
                allData = [];

            for (var i = minYear; i <= maxYear; i++) {
                var dataByYear = this.splitIndicatorDataByYear(indicatorChargingHourDataByWeekday, i),
                    allWeekdaysByYear = this.getWeekDayIndicatorData(dataByYear),
                    sumByYear = this.calculateSumIndicatorData(allWeekdaysByYear);

                allData.push(sumByYear + " Std.");
            }

            return allData;
        },

        /**
         * gets all data for the charging stations
         * @param  {boolean} async
         * @param  {Array} dataStreamIds
         * @return {Array} chargingData - per loadingpoint
         */
        createDataIndicatorChargingHour: function (async, dataStreamIds) {
            var chargingData,
                query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc)&$filter=",
                requestURL;

            _.each(dataStreamIds, function (id, index) {
                query = query + "@iot.id eq'" + id + "'";

                if (index !== (dataStreamIds.length - 1)) {
                    query = query + "or ";
                }
            });

            requestURL = this.buildRequestFromQuery(query);
            chargingData = this.sendRequest(requestURL, async);

            // if with one request not all data can be fetched
            _.each(chargingData, function (data) {
                var observationsID = data["@iot.id"],
                    observationsCount = data["Observations@iot.count"],
                    observationsLength = data.Observations.length;

                if (observationsCount > observationsLength) {
                    for (var i = observationsLength; i < observationsCount; i += observationsLength) {
                        var skipRequestURL = requestURL.split(")")[0] + ";$skip=" + observationsLength + ")&$filter=@iot.id eq'" + observationsID + "'",
                            skipChargingData = this.sendRequest(skipRequestURL, async);

                        data.Observations.push.apply(data.Observations, skipChargingData[0].Observations);
                    }
                }

            }, this);

            return chargingData;
        },

        /**
         * filters the data for the given year
         * @param  {Array} indicatorChargingHourDataByWeekday
         * @param  {number} year
         * @return {Array} dataByYear - data only with the given year
         */
        splitIndicatorDataByYear: function (indicatorChargingHourDataByWeekday, year) {
            var dataByYear = [];

            _.each(indicatorChargingHourDataByWeekday, function (weekday) {
                var wekdayData = [];

                _.each(weekday, function (hour) {
                    var hourData = [];

                    _.each(hour, function (data) {

                        if (data.phenomenonTime.substring(0, 4) === String(year)) {
                            hourData.push(data);
                        }
                    });
                    if (!_.isEmpty(hourData)) {
                        wekdayData.push(hourData);
                    }
                });
                if (!_.isEmpty(wekdayData)) {
                    dataByYear.push(wekdayData);
                }
            });
            return dataByYear;
        },

        /**
         * determines the data for each day of the week
         * mean and sum
         * @param  {Array} dataByYear
         * @return {Array}
         */
        getWeekDayIndicatorData: function (dataByYear) {
            var allData = [];

            for (var i = 0; i < 7; i++) {
                var dataPerHour = this.calculateWorkloadPerDayPerHour(dataByYear[i], "charging"),
                    processedData = this.calculateSumAndArithmeticMean(dataPerHour);

                    allData.push(processedData);
            }

            return allData;
        },

        /**
         * sums the data of the individual days of the week together
         * @param  {Array} allWeekdaysByYear
         * @return {number}
         */
        calculateSumIndicatorData: function (allWeekdaysByYear) {
            var sum = 0;

            _.each(allWeekdaysByYear, function (weekday) {
                _.each(weekday, function (hourData) {
                    sum += hourData.sum;
                });
            });

            return Math.round(sum);
        },

// *************************************************************
// ***** Processing data                                   *****
// *************************************************************
        /**
         *generates a record for each day of the week
         * @param  {Array} historicalData [description]
         * @param  {Date} lastDay - until this date the data will be evaluated
         * @return {Array}
         */
        processDataForAllWeekdays: function (historicalData, lastDay) {
            var historicalDataThisTimeZone,
                historicalDataWithIndex,
                dataByWeekday,
                dataPerHour,
                processedData,
                graphConfig;

            // Check if data is available
            if (!this.checkObservationsEmpty(historicalData)) {
                historicalDataThisTimeZone = this.changeTimeZone(historicalData);
                historicalDataWithIndex = this.addIndex(historicalDataThisTimeZone);
                dataByWeekday = this.divideDataByWeekday(historicalDataWithIndex, lastDay);
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

        /**
         * divides the day into 7 days of the week
         * and generate an observation for every day at 0 o'clock
         * @param  {Array} historicalDataWithIndex
         * @param  {Date} lastDay - the day on which the evaluation of the data should end
         * @return {}
         */
        divideDataByWeekday: function (historicalDataWithIndex, lastDay) {
            var weekArray = [[], [], [], [], [], [], []];

            _.each(historicalDataWithIndex, function (historicalData) {
                var observations = historicalData.Observations,
                    actualDay = moment().format("YYYY-MM-DD"),
                    thisLastDay = (_.isUndefined(lastDay)) ? moment(observations[(observations).length - 1].phenomenonTime).format("YYYY-MM-DD") : lastDay,
                    arrayIndex = 0,
                    booleanLoop = true;

                weekArray[arrayIndex].push([]);

                _.each(observations, function (data, index) {
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
                            (arrayIndex >= 6) ? arrayIndex = 0 : arrayIndex++;
                            weekArray[arrayIndex].push([]);
                        }
                    }
                });
            });

            return weekArray;
        },

        /**
         * create the config to draw graph
         * @param  {String} targetResult
         * @param  {String} graphTag
         * @param  {number} index
         */
        triggerToBarGraph: function (targetResult, graphTag, index) {
            var width = this.get("gfiWidth"),
                height = this.get("gfiHeight"),
                dataByWeekday = this.get("weekday"),
                dataPerHour,
                processedData;

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
                attrToShowArray: ["mean"]
            };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },

        /**
         * message if data is not evaluable or not existing
         * @param  {String} graphTag
         * @param  {number} width
         * @param  {number} height
         */
        drawErrorMessage: function (graphTag, width, height, index) {
            var today = moment().subtract(index, "days").format("dddd");

            $(".ladesaeulen .day").text(today).css("font-weight", "bold");
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
                var zeroTime = moment(moment(dayData[0].phenomenonTime).format("YYYY-MM-DD")).format("YYYY-MM-DDTHH:mm:ss"),
                    firstTimeDayData = moment(dayData[0].phenomenonTime).format("YYYY-MM-DDTHH:mm:ss"),
                    dayObj = this.createInitialDayPerHour();

                if (firstTimeDayData !== zeroTime) {
                    dayData.reverse();
                }

                dayObj = this.calculateWorkloadforOneDay(dayObj, dayData, targetResult);
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
        calculateSumAndArithmeticMean: function (dataPerHour) {
            var dayLength = 24,
                dayMeanArray = [];

            for (var i = 0; i <= dayLength; i++) {
                var arrayPerHour = [],
                    sum,
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
         * checks if processdData is existing
         * @param  {[type]} processedData [description]
         * @return {[type]}               [description]
         */
        checkValue: function (processedData, value) {
            return _.find(processedData, function (data) {
                return data[value] > 0;
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

            $(".ladesaeulen .day").text(today).css("font-weight", "bold");

            return stateLabel + today + "s";
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

    return ElektroladesaeulenTheme;
});
