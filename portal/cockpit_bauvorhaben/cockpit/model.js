import {getOrFilter, getFilter, getPropertyIsLike} from "./buildSld";
import {selectAll} from "d3-selection";
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
            "suburbs": []
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
            this.url = "/lgv-config/cockpit_bauvorhaben.json";
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
                dataWohneinheiten = [],
                dataWohneinheitenNochNichtImBau = [],
                dataWohneinheitenImBau = [];

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
                    this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", ".graph-tooltip-div-1", attributesToShow, "date", isMonthsSelected);
                }
                if (drawWohneinheiten) {
                    dataWohneinheiten = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true, false]});
                    this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-tooltip-div-2", attributesToShow, "date", isMonthsSelected);
                }
                if (drawWohneinheitenNochNichtImBau) {
                    dataWohneinheitenNochNichtImBau = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [false]});
                    this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneinheiten-noch-nicht-im-bau", ".graph-tooltip-div-3", attributesToShow, "date", isMonthsSelected);
                }
                if (drawWohneinheitenImBau) {
                    dataWohneinheitenImBau = this.prepareData(filteredData, administrativeUnits, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true]});
                    this.createGraph(dataWohneinheitenImBau, ".graph-wohneinheiten-im-bau", ".graph-tooltip-div-4", attributesToShow, "date", isMonthsSelected);
                }
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
            const xAxisDraw = $.find(".xAxisDraw > .domain")[0],
                xAxisWidth = xAxisDraw.getBoundingClientRect().width,
                widthPerSegment = Math.round(xAxisWidth / segments);

            selectAll(".xAxisDraw").selectAll(".tick > text")
                .html(function (d) {
                    return String(d).substring(0, 4);
                })
                .attr("transform", "translate(" + widthPerSegment / 2 + ", 0)");
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
                        if (filteredObjs.length === 1) {
                            preparedData.push(filteredObjs[0]);
                        }
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
                    margin: {top: 10, right: 10, bottom: 30, left: 70},
                    width: this.getGraphWidth(),
                    height: this.getGraphHeight(10, 30),
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

            // breite: 570 vs 552
            // ...kein plan warum der ca 20px zuviel ausgibt
            // ich ziehs mal ab
            return $(element).width() - 20;
        },
        /**
         * Returns the height from the cockpit-tool. This height is used to be set as graph-height
         * @param {Number} marginTop marginTop of graph
         * @param {Number} marginBottom marginBottom of graph
         * @returns {Number} - Height for graph in px
         */
        getGraphHeight: function (marginTop, marginBottom) {
            const sidebarHeight = $($.find(".sidebar")[0]).height(),
                headerHeight = $($.find("#cockpit_bauvorhaben > .header")[0]).height() + 20,
                filterHeight = $($.find("#cockpit_bauvorhaben > .filter")[0]).height() + 10,
                offsets = 4 * (marginTop + marginBottom),
                diff = sidebarHeight - headerHeight - filterHeight - offsets,
                diffPerGraph = diff / 4;

            return diffPerGraph;
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

        filterSuburbs: function (data) {
            const t = _.pluck(data, "suburb");

            this.setSuburbs([...new Set(t)].sort());
        },

        filterSuburbsByDistricts: function () {
            const districts = this.filterByAttribute(this.get("data"), this.get("filterObject").districts, "district");

            this.filterSuburbs(districts);
        },

        updateLayer: function (filterObject) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: "13802"});

            layer.get("layer").getLayers().forEach(olLayer => {
                const yearByLayerName = filterObject.years.filter(function (year) {
                    return olLayer.get("name") === year + " - genehmigt";
                });

                if (yearByLayerName.length === 0) {
                    olLayer.setVisible(false);
                }
                else {
                    olLayer.setVisible(true);
                    if (filterObject.districts.length > 0) {
                        this.updateLayerByDistricts(olLayer, filterObject.districts, yearByLayerName[0]);
                    }
                    else {
                        olLayer.setVisible(false);
                    }
                }
            });
            Radio.trigger("Map", "render");
        },

        updateLayerByDistricts: function (layer, districts, year) {
            let orFilter = "",
                sldBody;

            districts.forEach(district => {
                switch (district) {
                    case "Altona": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "A");
                        break;
                    }
                    case "Bergedorf": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "B");
                        break;
                    }
                    case "Eimsbüttel": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "E");
                        break;
                    }
                    case "Hamburg-Mitte": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "M");
                        break;
                    }
                    case "Hamburg-Nord": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "N");
                        break;
                    }
                    case "Harburg": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "H");
                        break;
                    }
                    case "Wandsbek": {
                        orFilter += getPropertyIsLike("geschaeftszeichen", "W");
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            if (districts.length > 1) {
                sldBody = getOrFilter(layer.getSource().getParams().LAYERS, orFilter, year);
            }
            else {
                sldBody = getFilter(layer.getSource().getParams().LAYERS, orFilter, year);
            }
            layer.getSource().updateParams({SLD_BODY: sldBody.replace(/\n/g, ""), STYLES: "style"});
        },

        setYears: function (value) {
            this.set("years", value);
        },

        setDistricts: function (value) {
            this.set("districts", value);
        },

        setSuburbs: function (value) {
            this.set("suburbs", value);
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
