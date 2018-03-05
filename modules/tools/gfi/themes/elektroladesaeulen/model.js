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

        loadData: function () {
            if (this.get("isVisible") === true) {
                var gfiContent = this.get("gfiContent"),
                    allProperties = this.splitProperties(gfiContent.allProperties),
                    dataStreamIds = allProperties.dataStreamId,
                    historicalData = this.createHistoricalData(false, dataStreamIds);

                this.processChargingIndicator(dataStreamIds);

                // start processing data
                this.processDataForAllWeekdays("available", historicalData);
                this.processDataForAllWeekdays("charging", historicalData);
                this.processDataForAllWeekdays("outoforder", historicalData);
            }
        },

        parseProperties: function () {
            var gfiContent = this.get("gfiContent"),
                gfiProperties = this.splitProperties(gfiContent[0]),
                allProperties = this.splitProperties(gfiContent.allProperties),
                dataStreamIds = allProperties.dataStreamId,
                requestURL = allProperties.requestURL,
                versionURL = allProperties.versionURL,
                gfiParams = this.get("feature").get("gfiParams"),
                indicatorDataArray;

            // set Properties
            this.set("requestURL", requestURL);
            this.set("versionURL", versionURL);
            this.set("dataStreamIds", dataStreamIds);
            this.set("gfiParams", gfiParams);

            this.createHeading(allProperties);

            gfiProperties = this.addChargingIndicator(gfiProperties, dataStreamIds);
            gfiProperties = this.changeStateToGerman(gfiProperties);

            this.set("gfiProperties", gfiProperties);
        },

        processChargingIndicator: function (dataStreamIds) {
            var indicatorDataArray = this.createChargingIndicator(false, dataStreamIds),
                indicatorPropertiesArray = [],
                indicatorPropertiesObj = {},
                tableheadIndicatorArray = [];

            // add indiocator to gfiProperties
            _.each(indicatorDataArray, function (indicator) {
                var erg = 0;

                tableheadIndicatorArray.push(indicator.year);
                _.each(indicator.loadingCount, function (value) {
                    erg = erg + value;
                });

                indicatorPropertiesArray.push(erg);
            });

            indicatorPropertiesObj["Anzahl der Ladungen"] = indicatorPropertiesArray;

            this.set("tableheadIndicatorArray", tableheadIndicatorArray);
            this.set("indicatorPropertiesObj", indicatorPropertiesObj);

        },

        addChargingIndicator: function (gfiProperties, dataStreamIds) {
            var indicatorDataArray = this.createChargingIndicator(false, dataStreamIds);

            // add indiocator to gfiProperties
            _.each(indicatorDataArray, function (indicator) {
                gfiProperties["Anzahl der Ladungen im Jahr " + indicator.year] = indicator.loadingCount;
            });

            _.invoke(gfiProperties);

            return gfiProperties;

        },

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

        createHeading: function (allProperties) {
            var tableheadArray = [],
                headTitleObject = {};

            if (this.attributes.name.indexOf("Elektro") !== -1) {
                this.createHeadingChargingStation(allProperties, headTitleObject);
                tableheadArray = this.createTableHeadingChargingStation(allProperties, tableheadArray);
            }

            this.set("tableheadArray", tableheadArray);
        },

        createHeadingChargingStation: function (allProperties, headTitleObject) {
            headTitleObject.StandortID = allProperties.chargings_station_nr[0];
            headTitleObject.Adresse = allProperties.location_name[0] + ", " +
                allProperties.postal_code[0] + " " + allProperties.city[0];
            headTitleObject.Eigentümer = allProperties.owner[0];

            this.set("headTitleObject", headTitleObject);
        },

        createTableHeadingChargingStation: function (allProperties, tableheadArray) {
            var stationNumbers = allProperties.sms_no_charging_station;

            _.each(stationNumbers, function (num) {
                tableheadArray.push("Ladepunkt: " + num);
            });

            return tableheadArray;
        },

        triggerToBarGraph: function (targetResult, graphTag, index) {
            var width = this.get("gfiWidth"),
                height = this.get("gfiHeight"),
                graphTag,
                dataByWeekday = this.get("weekday" + targetResult),
                dataPerHour,
                processedData;

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

            Radio.trigger("Graph", "createGraph", graphConfig);;
        },

        processDataForAllWeekdays: function (targetResult, historicalData) {
            var historicalDataThisTimeZone,
                historicalDataWithIndex,
                dataByWeekday,
                dataPerHour,
                processedData,
                graphConfig;

            historicalDataThisTimeZone = this.changeTimeZone(historicalData);
            historicalDataWithIndex = this.addIndex(historicalDataThisTimeZone);
            dataByWeekday = this.divideDataByWeekday(historicalDataWithIndex);

            this.set("weekday" + targetResult, dataByWeekday);
        },

        /**
         * builds the request and collect the historical data for each datastream
         * one object with results and phenomenonTimes for every chargingpoint
         * @param  {boolean} async - mode for ajax
         * @return {[Object]}
         */
        createHistoricalData: function (async, dataStreamIds) {
            var historicalData = [],
                gfiParams = this.get("gfiParams"),
                query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc",
                historicalData,
                requestURL;

            // add gfiParams
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

            requestURL = this.buildRequestForHistoricalData(query);
            historicalData = this.sendRequest(requestURL, async);

            // if with a request not all data can be fetched
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
                periodUnit = gfiParams.periodUnit;

            // handle Dates
            if (!_.isUndefined(startDate)) {
                // 7 days before to find the last state
                startDate = moment(startDate, "DD.MM.YYYY").subtract(7, "days").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";

                query = query + ";$filter=phenomenonTime gt " + startDate;

                if (!_.isUndefined(endDate)) {
                    endDate = moment(endDate, "DD.MM.YYYY").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";

                    query = query + " and phenomenonTime lt " + endDate;
                }
            }
            // handle period
            else if (!_.isUndefined(periodTime) && !_.isUndefined(periodUnit)) {
                var translate = {
                    Jahr: "years",
                    Monat: "months",
                    Woche: "weeks",
                    Tag: "days",
                    Jahre: "years",
                    Monate: "months",
                    Wochen: "weeks",
                    Tage: "days"
                    },
                    unit = translate[periodUnit],
                    // 7 days before to find the last state
                    time = moment().subtract(periodTime, unit).subtract(7, "days").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";

                query = query + ";$filter=phenomenonTime gt " + time;

            }

            return query;
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

        createChargingIndicator: function (async, dataStreamIds) {
            var historicalData = [],
                minYear = 2017,
                maxYear = moment().format("YYYY"),
                dataArray = [];

                for (var i = minYear; i <= maxYear; i++) {
                    var array = [],
                        data,
                        dataObj = {},
                        query = "?$expand=Observations($filter=result%20eq%27charging%27and%20year(phenomenonTime)%20eq%20" + i + ";$top=1)&$filter=";

                    _.each(dataStreamIds, function (id, index) {
                        query = query + "@iot.id eq'" + id + "'";

                        if (index !== (dataStreamIds.length - 1)) {
                            query = query + "or ";
                        }
                    });

                    data = this.sendRequest(this.buildRequestForHistoricalData(query), async);

                    _.each(data, function (loadingPoint) {
                        array.push(loadingPoint["Observations@iot.count"]);
                    });

                    dataObj.year = i;
                    dataObj.loadingCount = array;

                    dataArray.push(dataObj);
                }

            return dataArray;
        },

        /**
         * create the request for the historicaldata for one Datastream
         * @param  {String} requestURL
         * @param  {String} versionURL - version of the service
         * @param  {[type]} id - of the dataStream
         * @return {String} complete url
         */
        buildRequestForHistoricalData: function (query) {
            var requestURL = this.get("requestURL"),
                versionURL = this.get("versionURL");

            return historicalDataURL = requestURL + "/" +
                "v" + versionURL + "/" +
                "Datastreams" + query;
        },

        /**
         * chnage the timzone for the historicalData
         * @param  {[object]} historicalData
         * @return {[object]}
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
            var weekArray = [[], [], [], [], [], [], []];

            _.each(historicalDataWithIndex, function (historicalData) {
                var observations = historicalData.Observations,
                    actualDay = moment().format("YYYY-MM-DD"),
                    lastDay = moment(observations[(observations).length - 1].phenomenonTime).format("YYYY-MM-DD"),
                    arrayIndex = 0;

                weekArray[arrayIndex].push([]);

                _.each(observations, function (data, index) {
                    var phenomenonDay = moment(data.phenomenonTime).format("YYYY-MM-DD"),
                        zeroTime,
                        zeroResult,
                        weekArrayIndexLength;

                    // solange bis data verarbeitet wurde
                    while (true) {
                        weekArrayIndexLength = weekArray[arrayIndex].length - 1;
                        // wenn Observationstag = aktueller Tag, dann hinzufügen
                        if (phenomenonDay === actualDay) {
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
         * @param  {[[object]]} dataPerHour
         * @return {object}
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

        checkValue: function (processedData) {
            return _.find(processedData, function (data) {
                return data.value > 0;
            });
        },

        /**
         * calculates the available height for the graph
         * @param  {number} gfiHeight - height of the already drwan gfi
         * @return {String}
         */
        calculateHeight: function (gfiHeight) {
            var heightladesaeulenHeader = $(".ladesaeulenHeader").css("height").slice(0, -2),
                heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2);

            return gfiHeight - heightladesaeulenHeader - heightNavbar;
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
        },

        drawErrorMessage: function (graphTag, width, height) {
            $("<p class='noData' style='height: " + height + "px; width: " + width + "px;'>")
                    .appendTo("div" + graphTag)
                    .text("Zur Zeit keine Informationen!");
        }
    });

    return ElektroladesaeulenTheme;
});
