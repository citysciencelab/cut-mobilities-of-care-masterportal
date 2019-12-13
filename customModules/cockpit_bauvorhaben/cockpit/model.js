import {getOrFilter, getFilter, getPropertyIsLike} from "./buildSld";
/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "filterObject": {
                "districts": [],
                "suburbs": [],
                "years": [],
                "monthMode": true,
                "flatMode": false
            },
            "data": [],
            "years": [],
            "districts": [],
            "suburbs": [],
            "sumBaugenehmigungen": 0,
            "sumWohneinheiten": 0,
            "sumWohneinheitenNochNichtImBau": 0,
            "sumWohneinheitenImBau": 0,
            "sortedDistricts": ["Hamburg-Mitte", "Vorbehaltsgebiet HafenCity", "Altona", "Vorbehaltsgebiet Altona", "Eimsbüttel", "Hamburg-Nord", "Wandsbek", "Bergedorf", "Harburg"],
            "sortToBackValues": ["Hamburg gesamt", "Nicht georeferenziert"]
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
            this.url = "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/cockpit_bauvorhaben.json";
            this.fetch({async: false});
        },

        /**
         * Backbone function called after fetch() from initialize.
         * @param {JSON} data The parsed JSON data.
         * @returns {void}
         */
        parse: function (data) {
            this.filterYears(data);
            this.filterDistricts(data);
            this.filterSuburbs(data);
            this.setData(data);
        },
        /**
         * Prepares data for creating the graphs for Cockpit
         * @param {Boolean} drawBaugenehmigungen Flag if graph should be drawn
         * @param {Boolean} drawWohneinheiten Flag if graph should be drawn
         * @param {Boolean} drawWohneinheitenNochNichtImBau Flag if graph should be drawn
         * @param {Boolean} drawWohneinheitenImBau Flag if graph should be drawn
         * @returns {void}
         */
        prepareDataForGraph: function (drawBaugenehmigungen, drawWohneinheiten, drawWohneinheitenNochNichtImBau, drawWohneinheitenImBau) {
            const years = this.get("filterObject").years.sort(),
                districts = this.get("filterObject").districts,
                suburbs = this.get("filterObject").suburbs,
                administrativeUnits = {
                    values: suburbs.length > 0 ? suburbs : districts,
                    attrName: suburbs.length > 0 ? "suburb" : "district"
                },
                isMonthsSelected = this.get("filterObject").monthMode,
                isOnlyFlatSelected = this.get("filterObject").flatMode,
                data = this.get("data"),
                filteredData = this.filterData(data, administrativeUnits, years, isOnlyFlatSelected),
                attributesToShow = [];
            let dataBaugenehmigungen = [],
                sumBaugenehmigungen = 0,
                dataWohneinheiten = [],
                sumWohneinheiten = 0,
                dataWohneinheitenNochNichtImBau = [],
                sumWohneinheitenNochNichtImBau = 0,
                dataWohneinheitenImBau = [],
                sumWohneinheitenImBau = 0;

            if (filteredData.length > 0) {
                administrativeUnits.values.forEach(function (adminUnit, i) {
                    if (i < 10) {
                        attributesToShow.push({attrName: adminUnit, attrClass: "graph-line-" + i});
                    }
                    else {
                        attributesToShow.push({attrName: adminUnit, attrClass: "graph-line-other"});
                    }
                });

                if (drawBaugenehmigungen) {
                    dataBaugenehmigungen = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "building_project_count", {attributeName: "constructionStarted", values: [true, false]});
                    sumBaugenehmigungen = this.calculateSum(dataBaugenehmigungen, administrativeUnits);
                    this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", ".graph-tooltip-div-1", attributesToShow, "date", isMonthsSelected);
                }
                if (drawWohneinheiten) {
                    dataWohneinheiten = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true, false]});
                    sumWohneinheiten = this.calculateSum(dataWohneinheiten, administrativeUnits);
                    this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-tooltip-div-2", attributesToShow, "date", isMonthsSelected);
                }
                if (drawWohneinheitenNochNichtImBau) {
                    dataWohneinheitenNochNichtImBau = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [false]});
                    sumWohneinheitenNochNichtImBau = this.calculateSum(dataWohneinheitenNochNichtImBau, administrativeUnits);
                    this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneinheiten-noch-nicht-im-bau", ".graph-tooltip-div-3", attributesToShow, "date", isMonthsSelected);
                }
                if (drawWohneinheitenImBau) {
                    dataWohneinheitenImBau = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true]});
                    sumWohneinheitenImBau = this.calculateSum(dataWohneinheitenImBau, administrativeUnits);
                    this.createGraph(dataWohneinheitenImBau, ".graph-wohneinheiten-im-bau", ".graph-tooltip-div-4", attributesToShow, "date", isMonthsSelected);
                }
                if (isMonthsSelected) {
                    this.postprocessGraphs(years.length);
                }
                this.setSumBaugenehmigungen(sumBaugenehmigungen);
                this.setSumWohneinheiten(sumWohneinheiten);
                this.setSumWohneinheitenNochNichtImBau(sumWohneinheitenNochNichtImBau);
                this.setSumWohneinheitenImBau(sumWohneinheitenImBau);
            }
        },
        calculateSum: function (data, administrativeUnits) {
            let values = _.without(administrativeUnits.values, "Hamburg gesamt"),
                sum = 0;

            if (values.length === 0) {
                values = ["Hamburg gesamt"];
            }
            data.forEach(function (obj) {
                values.forEach(function (val) {
                    sum = sum + obj[val];

                });
            });

            return sum;
        },
        /**
         * Performs a postprocessing of the created graphs.
         * The texts under the ticks are moved inbetween the ticks on the right
         * @param {Number} segments Number of segments
         * @returns {void}
         */
        postprocessGraphs: function (segments) {
            const xAxisDraw = $.find(".xAxisDraw > .domain")[0],
                xAxisWidth = xAxisDraw.getBoundingClientRect().width,
                widthPerSegment = Math.round(xAxisWidth / segments);

            $.find(".xAxisDraw .tick > text").forEach(function (text) {
                $(text)
                    .prop("textContent", function (index, data) {
                        return String(data).substring(0, 4);
                    })
                    .attr("transform", "translate(" + widthPerSegment / 2 + ", 0)");
            });
        },
        /**
         * Filters data by selected administrative units, years and isOnlyFlatSelected
         * @param {Object[]} data All data
         * @param {Object} administrativeUnits All Selected administrative unit
         * @param {String[]} administrativeUnits.values All Selected administrative units
         * @param {String} administrativeUnits.attrName Name of attribute for administrative unit
         * @param {Number[]} years All selected years
         * @param {Boolean} isOnlyFlatSelected Flag if only the data objects have to be selected that have an "living_unit_count" > 0
         * @returns {Object[]} - filtered Data
         */
        filterData: function (data, administrativeUnits, years, isOnlyFlatSelected) {
            const filteredDataByAdminUnit = this.filterByAttribute(data, administrativeUnits.values, administrativeUnits.attrName),
                filteredDataByYear = this.filterByAttribute(data, years, "year"),
                filtered = this.intersectArrays(filteredDataByAdminUnit, filteredDataByYear);
            let filteredTotal = [];

            if (isOnlyFlatSelected) {
                filtered.forEach(function (obj) {
                    if (obj.isWohnbau > 0) {
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
         * @param {Object} administrativeUnits All Selected administrative unit
         * @param {String[]} administrativeUnits.values All Selected administrative units
         * @param {String} administrativeUnits.attrName Name of attribute for administrative unit
         * @param {Number []} years Selected years.
         * @param {Boolean} isMonthsSelected Flag if months view is checked
         * @param {String} attrName Name of the atttribute to be aggregated
         * @param {Object} condition Condition
         * @param {String} condition.attributeName Attribute name of the condition
         * @param {*[]} condition.values Attribute values of the condition
         * @returns {Object[]} - prepared Data.
         */
        prepareData: function (data, administrativeUnits, years, isMonthsSelected, attrName, condition) {
            var adminUnitsValues = administrativeUnits.values,
                adminUnitsAttrName = administrativeUnits.attrName,
                preparedData = [],
                months_short = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

            adminUnitsValues.forEach(function (adminUnit) {
                years.forEach(function (year) {
                    months_short.forEach(function (month_short) {
                        let filteredObjs = data.filter(obj => obj[adminUnitsAttrName] === adminUnit && obj.year === year && obj.month_short === month_short);
                        const fakeObj = {};

                        if (filteredObjs.length === 1) {
                            filteredObjs = this.filterByAttribute(filteredObjs, condition.values, condition.attributeName);
                        }
                        if (filteredObjs.length > 1) {
                            filteredObjs = this.aggregateByValues(filteredObjs, condition, attrName);
                        }
                        // create fake data for each timestep
                        if (filteredObjs.length === 0) {
                            fakeObj.year = year;
                            fakeObj.month_short = month_short;
                            fakeObj[adminUnitsAttrName] = adminUnit;
                            fakeObj[attrName] = 0;
                            filteredObjs.push(fakeObj);
                        }
                        preparedData.push(filteredObjs[0]);
                    }, this);
                }, this);
            }, this);
            preparedData = this.mergeMonthsToYears(preparedData, isMonthsSelected, years, administrativeUnits, attrName);
            preparedData = this.mergeByAttribute(preparedData, "date", attrName, administrativeUnits.attrName);
            preparedData = this.addNullValues(preparedData, adminUnitsValues);
            preparedData = Radio.request("Util", "sort", preparedData, "date");
            return preparedData;
        },
        /**
         * If "isMonthsSelcted"=== true: Creates an attribute "date" on each object consisting of year and month (yyyymm).
         * If "isMonthsSelcted"=== false: Merges the months for each administrative unit and year to a single object. Creates attribute "date" with eqals to "year".
         * @param {Object[]} data Data to merge.
         * @param {Boolean} isMonthsSelected Flag if months view is checked.
         * @param {Number[]} years Selected years.
         * @param {Object} administrativeUnits All Selected administrative unit
         * @param {String[]} administrativeUnits.values All Selected administrative units
         * @param {String} administrativeUnits.attrName Name of attribute for administrative unit
         * @param {String} attrName Attribute name
         * @returns {Object[]} - merged data.
         */
        mergeMonthsToYears: function (data, isMonthsSelected, years, administrativeUnits, attrName) {
            const adminUnitsValues = administrativeUnits.values,
                adminUnitsAttrName = administrativeUnits.attrName,
                preparedData = [];

            if (isMonthsSelected) {
                data.forEach(function (obj) {
                    obj.date = obj.year + obj.month_short;
                    preparedData.push(obj);
                }, this);
            }
            else {
                years.forEach(function (year) {
                    adminUnitsValues.forEach(function (adminUnit) {
                        const preparedYear = {
                                date: year
                            },
                            prefilteredData = data.filter(obj => obj.year === year && obj[adminUnitsAttrName] === adminUnit),
                            aggregate = this.aggregateByValues(prefilteredData, {attributeName: adminUnitsAttrName, values: [adminUnit]}, attrName);

                        preparedYear[adminUnitsAttrName] = adminUnit;
                        preparedYear[attrName] = aggregate[0][attrName];
                        preparedData.push(preparedYear);
                    }, this);
                }, this);
            }
            return preparedData;
        },
        /**
         * Adds for each object the attribute of a administrative unit with the value of 0. Only if the attribute is undefined.
         * @param {Object[]} data Object array to be extended.
         * @param {String[]} adminUnitsValues Selected administrative units.
         * @returns {Object[]} - the extended data.
         */
        addNullValues: function (data, adminUnitsValues) {
            data.forEach(function (obj) {
                adminUnitsValues.forEach(function (adminUnit) {
                    if (obj[adminUnit] === undefined) {
                        obj[adminUnit] = 0;
                    }
                });
            });
            return data;
        },
        /**
         * Sorts the data by "sortAttrName" and maps the attribute values to the attribute in "adminUnitsAttrName".
         * @param {Object[]} data Data
         * @param {String} sortAttrName Attribute name the data array is sorted.
         * @param {String} mergeAttr Attribute name of object that has to be mapped to the attribute in "adminUnitsAttrName".
         * @param {String} adminUnitsAttrName Attribute name of the administrative unit.
         * @returns {Object[]} - mapped data.
         */
        mergeByAttribute: function (data, sortAttrName, mergeAttr, adminUnitsAttrName) {
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
                    const adminUnit = obj[adminUnitsAttrName];

                    mergedObj[adminUnit] = obj[mergeAttr];
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
                    margin: {top: 10, right: 40, bottom: 30, left: 70},
                    width: this.getGraphWidth(),
                    height: 200,
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
                        offset: 50
                    },
                    attrToShowArray: attributesToShow,
                    legendData: [],
                    dotSize: 3
                };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },
        /**
         * Returns the width from the cockpit-tool. This width is used to be set as graph-width
         * @returns {Number} - Width for graph in px
         */
        getGraphWidth: function () {
            const element = $.find(".graphs")[0];

            return $(element).width();
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

        /**
         * Filters all distinct years from data json.
         * @param {Object[]} data All data.
         * @returns {void}
         */
        filterYears: function (data) {
            const t = _.pluck(data, "year");

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        /**
         * Filters all distinct districts from data json.
         * @param {Object[]} data All data.
         * @returns {void}
         */
        filterDistricts: function (data) {
            const t = _.pluck(data, "district");
            let set = [...new Set(t)];

            set = this.rearrangeArray(set, true, this.get("sortedDistricts"));
            set = this.rearrangeArray(set, false, this.get("sortToBackValues"));
            this.setDistricts(set);
        },

        /**
         * Filters all distinct suburbs from data json.
         * @param {Object[]} data All data.
         * @returns {void}
         */
        filterSuburbs: function (data) {
            const t = _.pluck(data, "suburb");
            let set = [...new Set(t)].sort();

            set = this.rearrangeArray(set, false, this.get("sortToBackValues"));
            this.setSuburbs(set);
        },
        /**
         * Rearranges the values in oldArray based on the order of values in newOrder.
         * @param {String[]} oldArray Array of Strings to be sorted.
         * @param {Boolean} setToFront Flag if the values in newOrder should be set to front or to back.
         * @param {String[]} newOrder  Array of strings defining the new order.
         * @returns {String[]} - rearranged array.
         */
        rearrangeArray: function (oldArray, setToFront, newOrder) {
            let oldArrayTemp = oldArray,
                rearrangedArray = [];

            newOrder.forEach(function (value) {
                if (oldArrayTemp.indexOf(value) !== -1) {
                    oldArrayTemp = _.without(oldArrayTemp, value);
                    rearrangedArray.push(value);
                }

            });
            if (setToFront) {
                rearrangedArray = _.union(rearrangedArray, oldArrayTemp);
            }
            else {
                rearrangedArray = _.union(oldArrayTemp, rearrangedArray);
            }

            return rearrangedArray;
        },
        /**
         * Filters all distinct suburbs that match the selected districts.
         * @param {Object[]} data All data.
         * @returns {void}
         */
        filterSuburbsByDistricts: function () {
            const districts = this.filterByAttribute(this.get("data"), this.get("filterObject").districts, "district");

            this.filterSuburbs(districts);
        },

        /**
         * Updates the layer based on the given selection. Either layer is set visible/invisible or the layer gets filtered via SLD-BODY
         * @param {Object} filterObject Object containing the filter properties.
         * @returns {void}
         */
        updateLayer: function (filterObject) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: "bauvorhaben"});

            layer.get("layer").getLayers().forEach(olLayer => {
                const yearByLayerName = filterObject.years.filter(function (year) {
                    return olLayer.get("name") === year + " - genehmigt";
                });

                if (yearByLayerName.length === 0) {
                    olLayer.setVisible(false);
                }
                else {
                    olLayer.setVisible(true);
                    if (filterObject.suburbs.length > 0) {
                        this.updateLayerByAdministrativeUnit(olLayer, filterObject.suburbs, "stadtteil", yearByLayerName[0], filterObject.flatMode);
                    }
                    else if (filterObject.districts.length > 0) {
                        this.updateLayerByAdministrativeUnit(olLayer, filterObject.districts, "bezirk", yearByLayerName[0], filterObject.flatMode);
                    }
                    else {
                        olLayer.setVisible(false);
                    }
                }
            });
            Radio.trigger("Map", "render");
        },

        /**
         * Creates an SLD-BODY, based on the users selection.
         * @param {ol/layer} layer The openlayers layer that gets the SLD-BODY.
         * @param {String[]} administrativeUnits The values of the administrative units to be filtered by.
         * @param {String} attr  The attribute name of the administrative unit in the dataset.
         * @param {String} year Layername containing the year.
         * @param {Boolean} flatMode Wohnungsbau flag
         * @returns {void}
         */
        updateLayerByAdministrativeUnit: function (layer, administrativeUnits, attr, year, flatMode) {
            const wohneinheiten = flatMode ? "1" : "0";
            let orFilter = "",
                sldBody;

            administrativeUnits.forEach(unit => {
                orFilter += getPropertyIsLike(attr, unit);
            });

            if (administrativeUnits.length > 1) {
                sldBody = getOrFilter(layer.getSource().getParams().LAYERS, orFilter, year, wohneinheiten);
            }
            else {
                sldBody = getFilter(layer.getSource().getParams().LAYERS, orFilter, year, wohneinheiten);
            }
            layer.getSource().updateParams({SLD_BODY: sldBody.replace(/\n/g, ""), STYLES: "style"});
        },

        /**
         * Setter for attribute "years"
         * @param {Number[]} value Years.
         * @returns {void}
         */
        setYears: function (value) {
            this.set("years", value);
        },

        /**
         * Setter for attribute "districts"
         * @param {String[]} value Districts.
         * @returns {void}
         */
        setDistricts: function (value) {
            this.set("districts", value);
        },

        /**
         * Setter for attribute "suburbs"
         * @param {String[]} value Suburbs.
         * @returns {void}
         */
        setSuburbs: function (value) {
            this.set("suburbs", value);
        },

        /**
         * Setter for attribute "data"
         * @param {String[]} value Data.
         * @returns {void}
         */
        setData: function (value) {
            this.set("data", value);
        },

        /**
         * Sets the given values to filterObject by given key
         * @param {String} key Key for values to be set.
         * @param {String/Number[]} value Values to be set.
         * @returns {void}
         */
        setFilterObjectByKey: function (key, value) {
            this.get("filterObject")[key] = value;
            this.updateLayer(this.get("filterObject"));
        },
        setSumBaugenehmigungen: function (value) {
            this.set("sumBaugenehmigungen", value);
        },
        setSumWohneinheiten: function (value) {
            this.set("sumWohneinheiten", value);
        },
        setSumWohneinheitenNochNichtImBau: function (value) {
            this.set("sumWohneinheitenNochNichtImBau", value);
        },
        setSumWohneinheitenImBau: function (value) {
            this.set("sumWohneinheitenImBau", value);
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
