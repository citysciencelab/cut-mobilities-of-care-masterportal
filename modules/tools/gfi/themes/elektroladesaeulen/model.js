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
         * get historical for visible gfi data asynchronously
         */
        loadData: function () {
            if (this.get("isVisible") === true) {
                var gfiContent = this.get("gfiContent"),
                    allProperties = this.splitProperties(gfiContent.allProperties),
                    dataStreamIds = allProperties.dataStreamId;

                this.createHistoricalData(true, dataStreamIds);
            }
        },

        parseProperties: function () {
            var gfiContent = this.get("gfiContent"),
                gfiProperties = this.splitProperties(gfiContent[0]),
                allProperties = this.splitProperties(gfiContent.allProperties),
                dataStreamIds = allProperties.dataStreamId,
                requestURL = allProperties.requestURL,
                versionURL = allProperties.versionURL,
                indicatorDataArray;

            // Alle Properties lassen sich auch so holen
            // this.attributes.feature.getProperties();
            // allProperties = this.splitProperties(this.collection.models[0].attributes.feature.getProperties()),

            // set Properties
            this.set("gfiProperties", gfiProperties);
            this.set("requestURL", requestURL);
            this.set("versionURL", versionURL);
            this.set("dataStreamIds", dataStreamIds);

            indicatorDataArray = this.createChargingIndicator(false, dataStreamIds);

            // indiocator anhängen an gfiProperties
            _.each(indicatorDataArray, function (indicator) {
                gfiProperties["Anzahl der Ladungen im Jahr " + indicator.year] = indicator.loadingCount;
            });

            _.invoke(gfiProperties);

            this.createHeading(allProperties);
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
                this.createTableHeadingChargingStation(allProperties, tableheadArray);
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

        triggerToBarGraph: function (targetResult, graphTag, gfiSize) {
            this.adjustGfiSize(gfiSize);

            var width = this.get("gfiWidth"),
                height = this.get("gfiHeight"),
                processedData = this.get(targetResult + "ProcessedData"),
                graphTag;

            // wait for data

            while (_.isUndefined(processedData)) {
            }

            // $(".ladesaeulen").removeClass("busy");
            processedData = this.get(targetResult + "ProcessedData");

            // set error message if data to targetresult does not exist
            if (_.isNull(processedData)) {
                this.drawErrorMessage(graphTag, width, height);
                return;
            }

            // *** eine andere Methode wäre die Zeitreihenanalyse ***
            // processedData = this.calculateWithAnotherFunction(dataPerHour);

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
                    label: this.createXAxisLabel(targetResult),
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

        // createD3Document: function (targetResult, graphTag, gfiSize) {
        createD3Document: function (targetResult, historicalData) {
            var startTime = new Date().getTime();

            var checkValue = this.checkValue(historicalData, targetResult),
                historicalDataThisTimeZone,
                historicalDataWithIndex,
                dataByWeekday,
                dataPerHour,
                processedData,
                graphConfig;

            // set a message if no data is found and exit
            if (_.isUndefined(checkValue)) {
                this.set(targetResult + "ProcessedData", null);
                return;
            }

            historicalDataThisTimeZone = this.changeTimeZone(historicalData);
            var time2 = new Date().getTime();
            // console.log(time2 - startTime);
            historicalDataWithIndex = this.addIndex(historicalDataThisTimeZone);
            var time3 = new Date().getTime();
            // console.log(time3 - time2);
            dataByWeekday = this.getDataByWeekday(historicalDataWithIndex);
            var time4 = new Date().getTime();
            // console.log(time4 - time3);
            dataPerHour = this.calculateWorkloadPerDayPerHour(dataByWeekday, targetResult);
            var time5 = new Date().getTime();
            // console.log(time5 - time4);
            processedData = this.calculateArithmeticMean(dataPerHour);
            var time6 = new Date().getTime();
            // console.log(time6 - time5);

            this.set(targetResult + "ProcessedData", processedData);
            var endTime = new Date().getTime();
            // console.log("Total:");
            // console.log(endTime - startTime);
            // console.log("-----------");
        },

        adjustGfiSize: function (gfiSize) {
            var width = this.get("gfiWidth"),
                height = this.get("gfiHeight");

            if (_.isUndefined(width) || _.isUndefined(height)) {
                this.set("gfiHeight", this.calculateHeight(gfiSize.height));
                this.set("gfiWidth", gfiSize.width);
            }
        },

        /**
         * builds the request and collect the historical data for each datastream
         * one object with results and phenomenonTimes for every chargingpoint
         * @param  {boolean} async - mode for ajax
         * @return {[Object]}
         */
        createHistoricalData: function (async, dataStreamIds) {
            var historicalData = [],
                query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc)";
                // dataStreamIds = this.get("dataStreamIds");

            query = query + "&$filter=";
            _.each(dataStreamIds, function (id, index) {
                query = query + "@iot.id eq'" + id + "'";

                if (index !== (dataStreamIds.length - 1)) {
                    query = query + "or ";
                }
            });

            this.sendRequestForHistoricalData(this.buildRequestForHistoricalData(query), async);
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

                    data = this.sendRequestForIndicator(this.buildRequestForHistoricalData(query), async);

                    _.each(data.value, function (loadingPoint) {
                        array.push(loadingPoint["Observations@iot.count"]);
                    });

                    dataObj.year = i;
                    dataObj.loadingCount = array;

                    dataArray.push(dataObj);
                }

            return dataArray;
        },

        sendRequestForIndicator: function (requestURLHistoricaldata, async) {
            var response;

            $.ajax({
                url: requestURLHistoricaldata,
                async: async,
                type: "GET",
                context: this,

                // handling response
                success: function (resp) {
                    response = resp;
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Es ist ein unerwarteter Fehler beim Anfordern der Daten für die Indikatoren aufgetreten!</strong>",
                        kategorie: "alert-danger"
                    });
                }
            });

            return response;
        },

        /**
         * returns the historicalData by Ajax-Request
         * @param  {String} requestURLHistoricaldata - url with query
         * @param  {boolean} async
         * @return {[Object]} historicalData
         */
        sendRequestForHistoricalData: function (requestURLHistoricaldata, async) {
           $.ajax({
                url: requestURLHistoricaldata,
                async: async,
                type: "GET",
                context: this,

                // handling response
                success: function (resp) {
                    var historicalData = resp.value;

                    this.createD3Document("available", historicalData);
                    this.createD3Document("charging", historicalData);
                    this.createD3Document("outoforder", historicalData);
                    $(".tab-pane").removeClass("busy");
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Es ist ein unerwarteter Fehler beim Anfordern der historischen Daten aufgetreten!</strong>",
                        kategorie: "alert-danger"
                    });
                }
            });
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
         * check if the requested value is existing in the historical data
         * @param  {[Object]} historicalData
         * @param  {String} targetResult
         * @return {Object}
         */
        checkValue: function (historicalData, targetResult) {
            var result = undefined;

            _.each(historicalData, function (data) {
                if (!_.isUndefined(result)) {
                    return;
                }

                result = _.find(data.Observations, function (obs) {
                    return obs.result === targetResult;
                });
            });

            return result;
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

        /**
         * filters the objects of the same day of the week as today
         * comparisons are made with the date
         * @param  {[object]} historicalData
         * @return {[object]}
         */
        getDataByWeekday: function (historicalData) {
            var processedArray = [];

            _.each(historicalData, function (loadingPointData) {
                var observations = loadingPointData.Observations,
                    lastDay = moment(observations[(observations).length - 1].phenomenonTime).format("YYYY-MM-DD"),
                    boolean = true,
                    count = 0,
                    loadingPointDataArray = [],
                    obsStart = 0,
                    obsEnd = observations.length;

                // this.set("searchIndex", obsStart);

                // loop about all days of the week that correspond to today's
                while (boolean) {
                    var intervalDay = moment().subtract(count, "days").format("YYYY-MM-DD"),
                        dataArray = [];

                    if (moment(intervalDay).diff(moment(lastDay)) < 0) {
                        boolean = false;
                        continue;
                    }
                    _.each(observations, function (data) {
                        var day = moment(data.phenomenonTime).format("YYYY-MM-DD");

                        if (day === intervalDay) {
                            dataArray.push(data);
                        }
                    });

                    initialWeekdayObj = this.createOfInitialTimeStepForOneDay(dataArray, observations, intervalDay, obsStart, obsEnd)
                    dataArray.push(initialWeekdayObj);

                    loadingPointDataArray.push(dataArray);
                    count += 7;
                    obsStart = initialWeekdayObj.index;
                }
                processedArray.push(loadingPointDataArray);
            }, this);

            return processedArray;
        },

        /**
         * creates an initial entry at 0 o'clock for one day
         * this searches for the last object of the previous day
         * @param  {array} dataArray - array with the entries of the day
         * @param  {[object]} observations - all observations from historicalData
         * @param  {String} intervalDay - current day
         * @param  {number} obsStart - restriction to search for the next record
         * @param  {number} obsEnd - length from dataArray
         * @return {Obj} with entrys of the day plus initial value
         */
        createOfInitialTimeStepForOneDay: function (dataArray, observations, intervalDay, obsStart, obsEnd) {
            var initialTime = moment(intervalDay).format("YYYY-MM-DDTHH:mm:ss"),
                initialWeekdayObj;

            // find last data by index
            if (dataArray.length > 0) {
                var i = dataArray[dataArray.length - 1].index,
                    dayBevorWeekdayObj = _.findWhere(observations, {index: i + 1});

                    if (_.isUndefined(dayBevorWeekdayObj)) {
                        var dayObj = _.findWhere(observations, {index: i});

                        initialWeekdayObj = dayObj;
                        initialWeekdayObj.result = undefined;
                        initialWeekdayObj.index = i + 1;
                    }
                    else {
                        initialWeekdayObj = dayBevorWeekdayObj;
                    }
            }
            else {
                var reduceIntervalDay = moment(intervalDay).subtract(1, "days").format("YYYY-MM-DD"),
                    nextDataObj = undefined,
                    initialWeekdayObj;

                // search for next event, date by date
                while (_.isUndefined(nextDataObj)) {
                    nextDataObj = _.find(observations.slice(obsStart, obsEnd), function (data) {
                        return moment(data.phenomenonTime).format("YYYY-MM-DD") === reduceIntervalDay;
                    });

                    reduceIntervalDay = moment(reduceIntervalDay).subtract(1, "days").format("YYYY-MM-DD");
                }

                initialWeekdayObj = nextDataObj;
            }

            initialWeekdayObj.phenomenonTime = initialTime;

            return initialWeekdayObj;
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

            _.each(dataByWeekday, function (loadingPointData) {
                var loadingPointArray = [];

                _.each(loadingPointData, function (dayData) {
                    var dayObj = this.createInitialDayPerHour(),
                        dayDataReverse = dayData.reverse();

                    dayObj = this.calculateWorkloadforOneDay(dayObj, dayDataReverse, targetResult);
                    loadingPointArray.push(dayObj);
                }, this);

                allDataArray.push(loadingPointArray);
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
         * if a day has only one event, then set values for whole day with result from this
         * @param {object} dayObj
         * @param {array} dayData
         * @param {String} targetResult
         */
        addValueToWholeDay: function (dayObj, dayData, targetResult) {
            var result = dayData[0].result,
                erg = (targetResult === result) ? 1 : 0;

            dayObj = _.object(_.map(dayObj, function (value, key) {
                return [key, erg];
            }));

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
                    dayObj[i] = undefined
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
            var allData = _.flatten(dataPerHour),
                dayLength = 24,
                dayMeanArray = [];

            for (var i = 0; i <= dayLength; i++) {
                var arrayPerHour = [],
                    mean,
                    obj = {};

                // returns an array which contains values at hour i
                _.each(allData, function (day) {
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
        createXAxisLabel: function (state) {
            var today = moment().format("dddd"),
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
