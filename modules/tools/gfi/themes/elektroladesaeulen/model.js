define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        d3 = require("d3"),
        ElektroladesaeulenTheme,
        moment = require("moment");

    ElektroladesaeulenTheme = Theme.extend({

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseProperties
            });
        },

        parseProperties: function () {
            var gfiContent = this.get("gfiContent"),
                gfiProperties = this.splitProperties(gfiContent[0]),
                allProperties = this.splitProperties(gfiContent.allProperties),
                dataStreamIds = allProperties.dataStreamId,
                requestURL = allProperties.requestURL,
                versionURL = allProperties.versionURL;

            // Alle Properties lassen sich auch so holen
            // this.attributes.feature.getProperties();
            // allProperties = this.splitProperties(this.collection.models[0].attributes.feature.getProperties()),

            // set Properties
            this.set("gfiProperties", gfiProperties);
            this.set("dataStreamIds", dataStreamIds);
            this.set("requestURL", requestURL);
            this.set("versionURL", versionURL);

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

        createD3Document: function () {
            var height = this.calculateHeight(),
                width = $(".gfi-content").css("width").slice(0, -2),
                targetResult = "available",
                historicalData = this.getHistoricalData(),
                historicalDataThisTimeZone = this.changeTimeZone(historicalData),
                historicalDataWithIndex = this.addIndex(historicalDataThisTimeZone),
                dataByWeekday = this.getDataByWeekday(historicalDataWithIndex),
                dataPerHour = this.calculateWorkloadPerDayPerHour(dataByWeekday, targetResult);
                dataByArithmeticMean = this.calculateArithmeticMean(dataPerHour);

                console.log(historicalData);
                console.log(historicalDataThisTimeZone);
                console.log(historicalDataWithIndex);
                console.log(dataByWeekday);
                console.log(dataPerHour);
                console.log(dataByArithmeticMean);

            // var graphConfig = {
            //     graphType: "Linegraph",
            //     selector: ".ladesaeulen-graph",
            //     width: width,
            //     height: height,
            //     selectorTooltip: ".ladesaeulen-graph-tooltip-div",
            //     scaleTypeX: "ordinal",
            //     scaleTypeY: "linear",
            //     data: processedData,
            //     xAttr: "data",
            //     xAxisLabel: "Zeitpunkt",
            //     attrToShowArray: ["erg"]
            // };

            //     // console.log(processedData);

            //     //********************
            //     var margin = margin = {top: 20, right: 20, bottom: 70, left: 70},
            //         selector = ".graph";

            //     width = width - margin.left - margin.right;
            //     height = height - margin.top - margin.bottom;

            //     var svg = this.createSvg(selector, margin, width, height),
            //         g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //     this.createGraph(processedData, width, height, g);
                //*************

                // Radio.trigger("Graph", "createGraph", graphConfig);
        },

        /**
         * returns the historicalData by Ajax-Request
         * one object with results and phenomenonTimes for every chargingpoint
         * @return {[object]}
         */
        getHistoricalData: function () {
            var response = [],
                requestURL = this.get("requestURL"),
                versionURL = this.get("versionURL"),
                dataStreamIds = this.get("dataStreamIds");

            _.each(dataStreamIds, function (id) {
                var requestURLHistoricaldata = this.buildRequestForHistoricalData(requestURL, versionURL, id);

                $.ajax({
                    url: requestURLHistoricaldata,
                    async: false,
                    type: "GET",
                    context: this,

                    // handling response
                    success: function (resp) {
                        response.push(resp);
                    },
                    error: function (jqXHR, errorText, error) {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Es ist ein unerwarteter Fehler beim Anfordern der historischen Daten aufgetreten!</strong>",
                            kategorie: "alert-danger"
                        });
                        return false;
                    }
                });
            }, this);

            return response;
        },

        /**
         * create the request for the historicaldata for one Datastream
         * @param  {String} requestURL
         * @param  {String} versionURL - version of the service
         * @param  {[type]} id - of the dataStream
         * @return {String} complete url
         */
        buildRequestForHistoricalData: function (requestURL, versionURL, id) {
            return historicalDataURL = requestURL + "/" +
                "v" + versionURL + "/" +
                "Datastreams(" + id +
                ")?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc)";
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
                    loadingPointDataArray = [];

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

                    dataArray.push(this.createOfInitialTimeStepForOneDay(dataArray, observations, intervalDay));

                    loadingPointDataArray.push(dataArray);
                    count += 7;
                }
                processedArray.push(loadingPointDataArray);
            }, this);

            return processedArray;
        },

        /**
         * creates an initial entry at 0 o'clock for one day
         * @param  {array} dataArray - array with the entries of the day
         * @param  {[object]} observations - all observations from historicalData
         * @param  {String} intervalDay - current day
         * @return {Obj} with entrys of the day plus initial value
         */
        createOfInitialTimeStepForOneDay: function (dataArray, observations, intervalDay) {
            var initialTime = moment(intervalDay).format("YYYY-MM-DDTHH:mm:ss");

            if (dataArray.length > 0) {
                var i = dataArray[dataArray.length - 1].index,
                    dayBevorWeekdayObj = _.findWhere(observations, {index: i + 1}),
                    initialWeekdayObj;

                    if (_.isUndefined(dayBevorWeekdayObj)) {
                        var dayObj = _.findWhere(observations, {index: i});

                        initialWeekdayObj = _.clone(dayObj);
                        initialWeekdayObj.result = undefined;
                        initialWeekdayObj.index = i + 1;
                    }
                    else {
                        initialWeekdayObj = _.clone(dayBevorWeekdayObj);
                    }
            }
            else {
                var reduceIntervalDay = moment(intervalDay).subtract(1, "days").format("YYYY-MM-DD"),
                    nextDataObj = [],
                    initialWeekdayObj;

                // search for next event, date by date
                while (_.isEmpty(nextDataObj)) {
                    nextDataObj = _.filter(observations, function (data) {
                        return moment(data.phenomenonTime).format("YYYY-MM-DD") === reduceIntervalDay;
                    });

                    reduceIntervalDay = moment(reduceIntervalDay).subtract(1, "days").format("YYYY-MM-DD");
                }
                initialWeekdayObj = _.clone(nextDataObj[0]);
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
                    var dayObj = this.createInitialDayPerHour();

                    if (dayData.length === 1) {
                        dayObj = this.addValueToWholeDay(dayObj, dayData, targetResult);
                    }
                    else {
                        var dayDataReverse = dayData.reverse();

                        dayObj = this.calculateWorkloadforOneDay(dayObj, dayDataReverse, targetResult);
                    }

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
                    dayObj[i] = "";
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
                dayObjSum = this.createInitialDayPerHour(),
                dayObjMean = this.createInitialDayPerHour(),
                numberOfObjects = allData.length;
                numberOfObjectsWithoutFuture = allData.length - dataPerHour.length,
                dayIndex = 24;

            _.each(allData, function (obj) {
                for (var i = 0; i < 24; i++) {
                    if (obj[i] === "") {
                        dayIndex = i;
                        break;
                    }
                    dayObjSum[i] = dayObjSum[i] + obj[i];
                }
            })

            _.each(dayObjSum, function (value, key) {
                if (key < dayIndex) {
                    dayObjMean[key] = Math.round(value / numberOfObjects * 1000) / 1000;
                }
                else {
                    dayObjMean[key] = Math.round(value / numberOfObjectsWithoutFuture * 1000) / 1000;
                }
            })

            return dayObjMean;
        },




        createGraph: function (processedData, width, height, g) {
            var x = d3.scaleTime()
                    .rangeRound([0, width]),
                y = d3.scaleLinear()
                    .rangeRound([height, 0]),
                line = d3.line()
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(d.value);
                    });

            x.domain(d3.extent(processedData, function (d) {
                return d.date;
            }));
            y.domain(d3.extent(processedData, function (d) {
                return d.value;
            }));

            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
            .select(".domain")
                .remove();

            g.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                    .attr("fill", "#000")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "0.71em")
                    .attr("text-anchor", "end")
                    .text("Price ($)");

            g.append("path")
                .datum(processedData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        },

        createSvg: function (selector, marginObj, width, height) {
             return d3.select(selector).append("svg")
                .attr("width", width + marginObj.left + marginObj.right)
                .attr("height", height + marginObj.top + marginObj.bottom)
                .attr("class", "graph-svg")
                .append("g")
                .attr("transform", "translate(" + marginObj.left + "," + marginObj.top + ")");
        },

        calculateHeight: function () {
            var heightGfiContent = $(".gfi-content").css("height").slice(0, -2),
                heightladesaeulenHeader = $(".ladesaeulenHeader").css("height").slice(0, -2),
                heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2);

            return heightGfiContent - heightladesaeulenHeader - heightNavbar;
        }
    });

    return ElektroladesaeulenTheme;
});
