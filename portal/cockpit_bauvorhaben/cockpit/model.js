import dataJSON from "./cockpit_bauvorhaben.json";

/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "filterObject": {
                "districts": [],
                "years": [],
                "monthMode": true,
                "flatMode": false
            },
            "data": []
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
            this.filterYears(dataJSON);
            this.filterDistricts(dataJSON);
            this.setData(dataJSON);
            this.trigger("render");
        },
        /**
         * Prepares data for creating the graphs for Cockpit
         * @returns {void}
         */
        prepareDataForGraph: function () {
            const years = this.get("filterObject").years.sort(),
                districts = this.get("filterObject").districts,
                isMonthsSelected = this.get("filterObject").monthMode,
                isOnlyFlatSelected = this.get("filterObject").flatMode,
                data = this.get("data"),
                filteredData = this.filterData(data, districts, years, isOnlyFlatSelected),
                dataBaugenehmigungen = this.prepareData(filteredData, districts, years, isMonthsSelected, "building_project_count", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheiten = this.prepareData(filteredData, districts, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheitenNochNichtImBau = this.prepareData(filteredData, districts, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [false]}),
                dataWohneinheitenImBau = this.prepareData(filteredData, districts, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true]}),
                attributesToShow = [];

            if (filteredData.length > 0) {
                districts.forEach(function (district) {
                    switch (district) {
                        case "Altona": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-altona"});
                            break;
                        }
                        case "Bergedorf": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-bergedorf"});
                            break;
                        }
                        case "Eimsbüttel": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-eimsbuettel"});
                            break;
                        }
                        case "Hamburg-Mitte": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-hamburg-mitte"});
                            break;
                        }
                        case "Hamburg-Nord": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-hamburg-nord"});
                            break;
                        }
                        case "Harburg": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-harburg"});
                            break;
                        }
                        case "Wandsbek": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-wandsbek"});
                            break;
                        }
                        default: {
                            attributesToShow.push({attrName: district, attrClass: "line"});
                            break;
                        }
                    }
                });
                this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", ".graph-tooltip-div-1", attributesToShow, "date", isMonthsSelected);
                this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-tooltip-div-2", attributesToShow, "date", isMonthsSelected);
                this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneineinheiten-noch-nicht-im-bau", ".graph-tooltip-div-3", attributesToShow, "date", isMonthsSelected);
                this.createGraph(dataWohneinheitenImBau, ".graph-wohneineinheiten-im-bau", ".graph-tooltip-div-4", attributesToShow, "date", isMonthsSelected);
                if (isMonthsSelected) {
                    this.postprocessGraphs(years.length);
                }
            }
        },
        /**
         * Performs a postprocessing of the created graphs.
         * The texts under the ticks are moved inbetween the ticks on the right
         * @param {Number} segments Number of segments
         * @returns {void}
         */
        postprocessGraphs: function (segments) {
            const tickTexts = $.find(".xAxisDraw > .tick > text"),
                xAxisDraw = $.find(".xAxisDraw > .domain")[0],
                xAxisWidth = xAxisDraw.getBoundingClientRect().width,
                widthPerSegment = Math.round(xAxisWidth / segments);

            tickTexts.forEach(function (tickText) {
                tickText.innerHTML = tickText.innerHTML.substring(0, 4);
                $(tickText).attr("transform", "translate(" + widthPerSegment / 2 + ", 0)");
            });
        },
        /**
         * Filters data by selected districts, years and isOnlyFlatSelected
         * @param {Object[]} data All data
         * @param {String[]} districts All Selected districts
         * @param {Number[]} years All selected years
         * @param {Boolean} isOnlyFlatSelected Flag if only the data objects have to be selected that have an "living_unit_count" > 0
         * @returns {Object[]} - filtered Data
         */
        filterData: function (data, districts, years, isOnlyFlatSelected) {
            const filteredDataByDistrict = this.filterByAttribute(data, districts, "district"),
                filteredDataByYear = this.filterByAttribute(data, years, "year"),
                filtered = this.intersectArrays(filteredDataByDistrict, filteredDataByYear);
            let filteredTotal = [];

            if (isOnlyFlatSelected) {
                filtered.forEach(function (obj) {
                    if (obj.living_unit_count > 0) {
                        filteredTotal.push(obj);
                    }
                });
            }
            else {
                filteredTotal = filtered;
            }

            return filteredTotal;
        },
        /**
         * Filters data objects whose "attributeName" is within the "valuesArray"
         * @param {Object[]} data Object Array to be filtered
         * @param {*[]} valuesArray Array of possible Values
         * @param {String} attributeName Name of the attribute that has to be filtered
         * @returns {Object[]} - Objects whose "attributeName" matches one value of the "valuesArray"
         */
        filterByAttribute: function (data, valuesArray, attributeName) {
            const filteredData = [];

            valuesArray.forEach(function (value) {
                const filteredDataByValue = data.filter(object => object[attributeName] === value);

                filteredDataByValue.forEach(function (object) {
                    filteredData.push(object);
                });
            });

            return filteredData;
        },
        /**
         * Intersects two arrays returning only the objects that are contained in both
         * @param {Object[]} array1 First array of objects
         * @param {Object[]} array2 Second array of object
         * @returns {Object[]} - Array of objects containing the objects that are in both arrays
         */
        intersectArrays: function (array1, array2) {
            const intersections = [];

            array1.forEach(function (object) {
                if (array2.includes(object)) {
                    intersections.push(object);
                }
            });
            return intersections;
        },
        /**
         * Prepares the data based on the given params so that the graph can be generated.
         * @param {Object[]} data All data.
         * @param {String[]} districts Selected districts.
         * @param {Number []} years Selected years.
         * @param {Boolean} isMonthsSelected Flag if months view is checked
         * @param {String} attrName Name of the atttribute to be aggregated
         * @param {Object} condition Condition
         * @param {String} condition.attributeName Attribute name of the condition
         * @param {*[]} condition.values Attribute values of the condition
         * @returns {Object[]} - prepared Data.
         */
        prepareData: function (data, districts, years, isMonthsSelected, attrName, condition) {
            var preparedData = [],
                months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                months_short = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

            districts.forEach(function (district) {
                years.forEach(function (year) {
                    months.forEach(function (month, i) {
                        let filteredObjs = data.filter(obj => obj.district === district && obj.year === year && obj.month === month);
                        const fakeObj = {};

                        if (filteredObjs.length > 1) {
                            filteredObjs = this.aggregateByValues(filteredObjs, condition, attrName);
                        }
                        // create fake data for each timestep
                        if (filteredObjs.length === 0) {
                            fakeObj.year = year;
                            fakeObj.month = month;
                            fakeObj.month_short = months_short[i];
                            fakeObj.district = district;
                            fakeObj[attrName] = 0;
                            filteredObjs.push(fakeObj);
                        }
                        if (filteredObjs.length === 1) {
                            preparedData.push(filteredObjs[0]);
                        }
                    }, this);
                }, this);
            }, this);
            preparedData = this.mergeMonthsToYears(preparedData, isMonthsSelected, years, districts, attrName);
            preparedData = this.mergeByAttribute(preparedData, "date", attrName);
            preparedData = this.addNullValues(preparedData, districts);
            preparedData = Radio.request("Util", "sort", preparedData, "date");
            return preparedData;
        },
        /**
         * If "isMonthsSelcted"=== true: Creates an attribute "date" on each object consisting of year and month (yyyymm).
         * If "isMonthsSelcted"=== false: Merges the months for each district and year to a single object. Creates attribute "date" with eqals to "year".
         * @param {Object[]} data Data to merge.
         * @param {Boolean} isMonthsSelected Flag if months view is checked.
         * @param {Number[]} years Selected years.
         * @param {String[]} districts Selected districts.
         * @param {String} attrName Attribute name
         * @returns {Object[]} - merged data.
         */
        mergeMonthsToYears: function (data, isMonthsSelected, years, districts, attrName) {
            const preparedData = [];

            if (isMonthsSelected) {
                data.forEach(function (obj) {
                    obj.date = obj.year + obj.month_short;
                    preparedData.push(obj);
                }, this);
            }
            else {
                years.forEach(function (year) {
                    districts.forEach(function (district) {
                        const preparedYear = {
                                date: year,
                                district: district
                            },
                            prefilteredData = data.filter(obj => obj.year === year && obj.district === district),
                            aggregate = this.aggregateByValues(prefilteredData, {attributeName: "district", values: [district]}, attrName);

                        preparedYear[attrName] = aggregate[0][attrName];
                        preparedData.push(preparedYear);
                    }, this);
                }, this);
            }
            return preparedData;
        },
        /**
         * Adds for each object the attribute of a district with the value of 0. Only if the attribute is undefined.
         * @param {Object[]} data Object array to be extended.
         * @param {String[]} districts Selected districts.
         * @returns {Object[]} - the extended data.
         */
        addNullValues: function (data, districts) {
            data.forEach(function (obj) {
                districts.forEach(function (value) {
                    if (obj[value] === undefined) {
                        obj[value] = 0;
                    }
                });
            });
            return data;
        },
        /**
         * Sorts the data by "sortAttrName" and maps the attribute values to the districts.
         * @param {Object[]} data Data
         * @param {String} sortAttrName Attribute name the data array is sorted.
         * @param {String} mergeAttr Attribute name of object that has to be mapped to the district.
         * @returns {Object[]} - mapped data.
         */
        mergeByAttribute: function (data, sortAttrName, mergeAttr) {
            let values = [];
            const mergedData = [];

            data.forEach(function (obj) {
                values.push(obj[sortAttrName]);
            });
            values.sort();
            values = values.filter((item, index)=> {
                return values.indexOf(item) === index;
            });
            values.forEach(function (value) {
                const filteredObjs = data.filter(obj => obj[sortAttrName] === value),
                    mergedObj = {};

                mergedObj[sortAttrName] = value;
                filteredObjs.forEach(function (obj) {
                    const district = obj.district;

                    mergedObj[district] = obj[mergeAttr];
                    mergedObj.class = "dot";
                    mergedObj.style = "circle";
                });
                mergedData.push(mergedObj);
            });

            return mergedData;
        },
        /**
         * Aggregates the data by attrName matching the condition.
         * @param {Object[]} data Data to be aggregated.
         * @param {Object} condition Condition.
         * @param {String} condition.attributeName Attribute name of the condition.
         * @param {*[]} condition.values Attribute values of the condition.
         * @param {String} attrName Attribute name to be aggregated.
         * @returns {Object[]} - Array of on aggregated object.
         */
        aggregateByValues: function (data, condition, attrName) {
            const conditionAttribute = condition.attributeName,
                conditionValues = condition.values,
                prefilteredData = this.filterByAttribute(data, conditionValues, conditionAttribute),
                aggregate = Object.assign({}, prefilteredData[0]);

            prefilteredData.forEach(function (obj, index) {
                if (index > 0) {
                    const objHasValue = conditionValues.includes(obj[conditionAttribute]);

                    if (objHasValue) {
                        aggregate[attrName] = aggregate[attrName] + obj[attrName];
                    }
                }
            });
            aggregate[conditionAttribute] = undefined;
            return [aggregate];
        },
        /**
         * Creates the graph
         * @param {Object[]} data Prepared data.
         * @param {String} selector Selector class of graph.
         * @param {String} selectorTooltip Selector class of graph-tooltip.
         * @param {attributeToShow[]} attributesToShow Array of attributes to show.
         * @param {String} xAttr Attribute name for x axis.
         * @param {Boolean} isMonthsSelected Flag if monthsMode is selected.
         * @param {Object} attributeToShow Attributes to show.
         * @param {String} attributeToShow.attrName Attributes name.
         * @param {String} attributeToShow.attrClass Attributes class.
         * @returns {void}
         * @fires Graph#RadioTriggerGraphCreateGraph
         */
        createGraph: function (data, selector, selectorTooltip, attributesToShow, xAttr, isMonthsSelected) {
            const xAxisTicks = this.createTicks(data, isMonthsSelected),
                graphConfig = {
                    graphType: "Linegraph",
                    selector: selector,
                    width: 400,
                    height: 250,
                    margin: {top: 20, right: 20, bottom: 50, left: 70},
                    svgClass: "graph-svg",
                    selectorTooltip: selectorTooltip,
                    scaleTypeX: "ordinal",
                    scaleTypeY: "linear",
                    data: data,
                    xAttr: xAttr,
                    xAxisTicks: xAxisTicks,
                    xAxisLabel: {
                        label: "Jahre",
                        translate: 20
                    },
                    yAxisLabel: {
                        label: "Anzahl",
                        offset: 10
                    },
                    attrToShowArray: attributesToShow,
                    legendData: []
                };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },
        /**
         * Creates ticks if monthsMode is selected.
         * @param {Object[]} data Prepared data.
         * @param {Boolean} isMonthsSelected Flag if monthsMode is selected.
         * @returns {undefined/Object[]} - xAxisTicks if "isMonthsSelected". Otherwise undefined.
         */
        createTicks: function (data, isMonthsSelected) {
            let xAxisTicks;
            const values = [];

            if (isMonthsSelected) {
                data.forEach(function (obj) {
                    if (obj.date.length === 6 && obj.date.match(/.*01$/)) {
                        values.push(obj.date);
                    }
                });
                xAxisTicks = {
                    values: values
                };
            }

            return xAxisTicks;
        },
        filterYears: function (data) {
            const t = _.pluck(data, "year");

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        filterDistricts: function (data) {
            const t = _.pluck(data, "district");

            this.setDistricts([...new Set(t)].sort());
        },

        updateLayer: function (filterObject) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: "13872"});

            layer.get("layer").getLayers().forEach(function (ollayer) {
                const yearByLayerName = filterObject.years.filter(function (year) {
                    return ollayer.get("name") === year + " - erledigt";
                });

                if (yearByLayerName.length === 0) {
                    ollayer.setVisible(false);
                }
                else {
                    ollayer.setVisible(true);
                }
            });
        },

        setYears: function (value) {
            this.set("years", value);
        },

        setDistricts: function (value) {
            this.set("districts", value);
        },

        setData: function (value) {
            this.set("data", value);
        },

        setFilterObjectByKey: function (key, value) {
            this.get("filterObject")[key] = value;
            this.updateLayer(this.get("filterObject"));
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
