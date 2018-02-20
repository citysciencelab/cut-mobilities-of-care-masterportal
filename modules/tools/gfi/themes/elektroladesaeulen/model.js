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

        buildRequestForHistoricalData: function (requestURL, versionURL, id) {
            return historicalDataURL = requestURL + "/" +
                "v" + versionURL + "/" +
                "Datastreams(" + id +
                ")?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc)";
        },

        /**
         * returns the today weekday
         * @return {String} weekday
         */
        getWeekDay: function () {
            dayCount = new Date().getDay(),
            weekday = ["Son","Mon","Tue","Wed","Thu","Fri","Sat"];

            return weekday[dayCount];
        },

        processData: function (historicalData) {
            var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ"),
                processedData = [];

                _.each(historicalData, function (data) {
                    var dataArray = [];

                    _.each(data.Observations, function (obs, index) {
                        var processedObj = {};

                        processedObj.date = parseTime(obs.phenomenonTime);
                        processedObj.value = (obs.result === "charging") ? 1 : 0;
                        processedObj.result = obs.result;
                        processedObj.index = index;

                        dataArray.push(processedObj);
                    });
                        processedData.push(dataArray);
                });

            return processedData;
        },

        filterProcessedDataByWeekDay: function (processedData) {
            var processedDataWeekDayDate = [],
                weekday = this.getWeekDay();

            _.each(processedData, function (proData) {
                // filtert alle Objekte mit dem aktuellen Wochentag
                var dataArray = _.filter(proData, function (obj) {
                        return String(obj.date).includes(weekday);
                    }),
                    thingArray = [],
                    count = 0;

                // durchläuft alle Daten des aktuellen Wochentages
                _.each(dataArray, function (data, index) {
                    // count wird auf die Anzahl gestezt, die mit dem gleichen Datum zusammengefasst wurden,
                    // so werden diese Datensätze übersprungen
                    if (index !== count) {
                        return;
                    }

                    var arrayByDate = this.filterObjectsWithEqualDate(dataArray, data);

                    // count wird auf die Anzahl der bereits bearbeiteten Daten gesetzt
                    count = count + arrayByDate.length;

                    thingArray.push(arrayByDate);
                }, this);

                processedDataWeekDayDate.push(thingArray);
            }, this);

            return processedDataWeekDayDate;
        },

        // filtert alle Objekte mit dem gleichen Datum
        filterObjectsWithEqualDate: function (dataArray, data) {
            var date = String(data.date).substring(0, 15);

            return _.filter(dataArray, function (obj) {
                        return String(obj.date).includes(date);
                });
        },

        // removeDuplicates: function (arrayByDate) {
        //     return _.uniq(arrayByDate, function (item, key, date) {
        //         return String(item.date);
        //     });
        // },

        addMissingDays: function (processedDataWeekDay) {
            _.each(processedDataWeekDay, function (loadingPointData) {
                var firstDate = new Date(String(loadingPointData[0][0].date).substring(0, 15)),
                    lastDate = new Date(String(loadingPointData[loadingPointData.length - 1][0].date).substring(0, 15));

                    console.log(firstDate);
                    console.log(lastDate);

                _.each(loadingPointData, function (dayData) {
                    var date = new Date(String(dayData[0].date).substring(0, 15));

                    if (String(date) === String(firstDate)) {
                        console.log(firstDate - 7);
                    }

                    console.log(date);

                });
            });

            return undefined;
        },

        getDataByWeekday: function (historicalData) {
            var processedArray = [];

            _.each(historicalData, function (loadingPointData) {
                var observations = loadingPointData.Observations,
                    lastDay = moment(observations[(observations).length - 1].phenomenonTime).format("DD MMMM YYYY"),
                    boolean = true,
                    count = 0,
                    loadingPointDataArray = [];

                // Durclauf aller Wochentage, die dem heutigen entsprechen
                while (boolean) {
                    var intervalDay = moment().subtract(count, "days").format("DD MMMM YYYY"),
                        dataArray = [];

                    if (moment(intervalDay).diff(moment(lastDay)) < 0) {
                        boolean = false;
                        continue;
                    }

                    _.each(observations, function (data) {
                        var day = moment(data.phenomenonTime).format("DD MMMM YYYY");

                        if (day === intervalDay) {
                            dataArray.push(data);
                        }
                    });

                    dataArray.push(this.createOfInitialWeekday(dataArray, observations, intervalDay));

                    loadingPointDataArray.push(dataArray);
                    count += 7;
                }
                processedArray.push(loadingPointDataArray);
            }, this);

            return processedArray;
        },

        createOfInitialWeekday: function (dataArray, observations, intervalDay) {
            var initialTime = moment(intervalDay).format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";

            if (dataArray.length > 0) {
                var i = dataArray[dataArray.length - 1].index,
                    dayBevorWeekdayObj = _.findWhere(observations, {index: i + 1}),
                    initialWeekdayObj = _.clone(dayBevorWeekdayObj);
            }
            else {
                var reduceIntervalDay = moment(intervalDay).subtract(1, "days").format("DD MMMM YYYY"),
                    nextDataObj = [],
                    initialWeekdayObj;

                // nächstes Event suchen, Datum für datum
                while (_.isEmpty(nextDataObj)) {
                    nextDataObj = _.filter(observations, function (data) {
                        return moment(data.phenomenonTime).format("DD MMMM YYYY") === reduceIntervalDay;
                    });

                    reduceIntervalDay = moment(reduceIntervalDay).subtract(1, "days").format("DD MMMM YYYY");
                }
                initialWeekdayObj = _.clone(nextDataObj[0]);
            }
            initialWeekdayObj.phenomenonTime = initialTime;

            return initialWeekdayObj;
        },

        addIndex: function (historicalData) {
            _.each(historicalData, function (loadingPointData) {
                _.each(loadingPointData.Observations, function (obs, index) {
                    obs.index = index;
                });
            });

            return historicalData;
        },

        createD3Document: function () {
            var height = this.calculateHeight(),
                width = $(".gfi-content").css("width").slice(0, -2),
                historicalData = this.getHistoricalData(),
                historicalDataWithIndex = this.addIndex(historicalData),
                dataByWeekday = this.getDataByWeekday(historicalDataWithIndex);
                // processedData = this.processData(historicalData),
                // processedDataWeekDay = this.filterProcessedDataByWeekDay(processedData),
                // processedDataWeekDayComplete = this.addMissingDays(processedDataWeekDay);

                console.log(historicalData);
                console.log(historicalDataWithIndex);
                console.log(dataByWeekday);
                // console.log(processedData);
                // console.log(processedDataWeekDay);
                // console.log(processedDataWeekDayComplete);


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

        // getter for attrToShow
        // getAttrToShow: function () {
        //     return this.get("attrToShow");
        // },
        // // setter for attrToShow
        // setAttrToShow: function (value) {
        //     this.set("attrToShow", value);
        // }

    });

    return ElektroladesaeulenTheme;
});
