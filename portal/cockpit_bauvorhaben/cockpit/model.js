/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "years": [2015, 2016, 2017],
            "bezirke": ["Hamburg-Nord", "Altona"],
            "isMonthsSelected": true,
            "data": [{ "year" : 2017, "month" : "April", "bezirk" : "Bergedorf", "bauvorhaben" : 21, "wohneinheiten" : 38, "constructionStarted" : true }, { "year" : 2015, "month" : "Oktober", "bezirk" : "Wandsbek", "bauvorhaben" : 78, "wohneinheiten" : 61, "constructionStarted" : true }, { "year" : 2016, "month" : "März", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 25, "wohneinheiten" : 5, "constructionStarted" : false }, { "year" : 2015, "month" : "April", "bezirk" : "Wandsbek", "bauvorhaben" : 49, "wohneinheiten" : 59, "constructionStarted" : true }, { "year" : 2015, "month" : "Januar", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 1, "wohneinheiten" : 0, "constructionStarted" : false }, { "year" : 2015, "month" : "Oktober", "bezirk" : "Altona", "bauvorhaben" : 21, "wohneinheiten" : 158, "constructionStarted" : false }, { "year" : 2019, "month" : "März", "bezirk" : "Hamburg-Mitte", "bauvorhaben" : 60, "wohneinheiten" : 231, "constructionStarted" : false }, { "year" : 2015, "month" : "Oktober", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 20, "wohneinheiten" : 31, "constructionStarted" : false }, { "year" : 2018, "month" : "August", "bezirk" : "Bergedorf", "bauvorhaben" : 10, "wohneinheiten" : 6, "constructionStarted" : false }, { "year" : 2019, "month" : "Februar", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 50, "wohneinheiten" : 109, "constructionStarted" : false }, { "year" : 2017, "month" : "April", "bezirk" : "Wandsbek", "bauvorhaben" : 38, "wohneinheiten" : 151, "constructionStarted" : true }, { "year" : 2019, "month" : "Februar", "bezirk" : "Bergedorf", "bauvorhaben" : 20, "wohneinheiten" : 66, "constructionStarted" : false }, { "year" : 2018, "month" : "September", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 17, "wohneinheiten" : 17, "constructionStarted" : true }, { "year" : 2017, "month" : "April", "bezirk" : "Harburg", "bauvorhaben" : 39, "wohneinheiten" : 134, "constructionStarted" : true }, { "year" : 2018, "month" : "Juni", "bezirk" : "Hamburg-Mitte", "bauvorhaben" : 25, "wohneinheiten" : 80, "constructionStarted" : true }, { "year" : 2015, "month" : "März", "bezirk" : "Bergedorf", "bauvorhaben" : 6, "wohneinheiten" : 2, "constructionStarted" : true }, { "year" : 2015, "month" : "Oktober", "bezirk" : "Eimsbüttel", "bauvorhaben" : 12, "wohneinheiten" : 4, "constructionStarted" : true }, { "year" : 2017, "month" : "Januar", "bezirk" : "Altona", "bauvorhaben" : 24, "wohneinheiten" : 36, "constructionStarted" : true }, { "year" : 2015, "month" : "August", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 32, "wohneinheiten" : 26, "constructionStarted" : true }, { "year" : 2016, "month" : "September", "bezirk" : "Bergedorf", "bauvorhaben" : 46, "wohneinheiten" : 85, "constructionStarted" : true }, { "year" : 2019, "month" : "Januar", "bezirk" : "Hamburg-Mitte", "bauvorhaben" : 50, "wohneinheiten" : 15, "constructionStarted" : false }, { "year" : 2016, "month" : "März", "bezirk" : "Wandsbek", "bauvorhaben" : 54, "wohneinheiten" : 60, "constructionStarted" : true }, { "year" : 2018, "month" : "März", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 37, "wohneinheiten" : 74, "constructionStarted" : true }, { "year" : 2015, "month" : "Oktober", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 44, "wohneinheiten" : 105, "constructionStarted" : true }, { "year" : 2016, "month" : "Januar", "bezirk" : "Wandsbek", "bauvorhaben" : 48, "wohneinheiten" : 108, "constructionStarted" : true }, { "year" : 2017, "month" : "Dezember", "bezirk" : "Wandsbek", "bauvorhaben" : 31, "wohneinheiten" : 106, "constructionStarted" : true }, { "year" : 2015, "month" : "November", "bezirk" : "Bergedorf", "bauvorhaben" : 12, "wohneinheiten" : 1, "constructionStarted" : true }, { "year" : 2016, "month" : "Februar", "bezirk" : "Bergedorf", "bauvorhaben" : 21, "wohneinheiten" : 26, "constructionStarted" : true }, { "year" : 2017, "month" : "Februar", "bezirk" : "Hamburg-Mitte", "bauvorhaben" : 34, "wohneinheiten" : 444, "constructionStarted" : true }, { "year" : 2015, "month" : "Februar", "bezirk" : "Harburg", "bauvorhaben" : 10, "wohneinheiten" : 6, "constructionStarted" : true }, { "year" : 2017, "month" : "September", "bezirk" : "Harburg", "bauvorhaben" : 17, "wohneinheiten" : 24, "constructionStarted" : false }, { "year" : 2017, "month" : "Mai", "bezirk" : "Bergedorf", "bauvorhaben" : 8, "wohneinheiten" : 0, "constructionStarted" : false }, { "year" : 2015, "month" : "November", "bezirk" : "Altona", "bauvorhaben" : 34, "wohneinheiten" : 44, "constructionStarted" : true }, { "year" : 2017, "month" : "Dezember", "bezirk" : "Eimsbüttel", "bauvorhaben" : 9, "wohneinheiten" : 4, "constructionStarted" : true }, { "year" : 2017, "month" : "September", "bezirk" : "Bergedorf", "bauvorhaben" : 11, "wohneinheiten" : 7, "constructionStarted" : false }, { "year" : 2017, "month" : "September", "bezirk" : "Bergedorf", "bauvorhaben" : 19, "wohneinheiten" : 25, "constructionStarted" : true }, { "year" : 2018, "month" : "Juni", "bezirk" : "Altona", "bauvorhaben" : 12, "wohneinheiten" : 47, "constructionStarted" : true }, { "year" : 2015, "month" : "Februar", "bezirk" : "Hamburg-Nord", "bauvorhaben" : 8, "wohneinheiten" : 4, "constructionStarted" : false }]
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
        },
        prepareDataForGraph: function () {
            const years = this.get("years").sort(),
                bezirke = this.get("bezirke"),
                isMonthsSelected = this.get("isMonthsSelected"),
                data = this.get("data"),
                filteredData = this.filterData(data, bezirke, years),
                dataBaugenehmigungen = this.prepareData(filteredData, bezirke, years, isMonthsSelected, "bauvorhaben", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheiten = this.prepareData(filteredData, bezirke, years, isMonthsSelected, "wohneinheiten", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheitenNochNichtImBau = this.prepareData(filteredData, bezirke, years, isMonthsSelected, "wohneinheiten", {attributeName: "constructionStarted", values: [false]}),
                dataWohneinheitenImBau = this.prepareData(filteredData, bezirke, years, isMonthsSelected, "wohneinheiten", {attributeName: "constructionStarted", values: [true]});

            // console.log(dataBaugenehmigungen);
            // console.log(dataWohneinheiten);
            // console.log(dataWohneinheitenNochNichtImBau);
            // console.log(dataWohneinheitenImBau);
            this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", "graph-baugenehmigungen-tooltip-div", bezirke, "date");
            this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-wohneinheiten-tooltip-div", bezirke, "date");
            this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneineinheiten-noch-nicht-im-bau", ".graph-wohneineinheiten-noch-nicht-im-bau-tooltip-div", bezirke, "date");
            this.createGraph(dataWohneinheitenImBau, ".graph-wohneineinheiten-im-bau", ".graph-wohneineinheiten-im-bau-tooltip-div", bezirke, "date");
        },
        filterData: function (data, bezirke, years) {
            const filteredDataByBezirk = this.filterByAttribute(data, bezirke, "bezirk"),
                filteredDataByYear = this.filterByAttribute(data, years, "year"),
                filteredTotal = this.intersectArrays(filteredDataByBezirk, filteredDataByYear);

            return filteredTotal;
        },
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
        intersectArrays: function (array1, array2) {
            const intersections = [];

            array1.forEach(function (object) {
                if (array2.includes(object)) {
                    intersections.push(object);
                }
            });
            return intersections;
        },
        prepareData: function (data, bezirke, years, isMonthsSelected, attrName, condition) {
            var preparedData = [],
                months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

            bezirke.forEach(function (bezirk) {
                years.forEach(function (year) {
                    months.forEach(function (month) {
                        let filteredObjs = data.filter(obj => obj.bezirk === bezirk && obj.year === year && obj.month === month);

                        if (filteredObjs.length > 1) {
                            filteredObjs = this.aggregateByValues(filteredObjs, condition, attrName);
                        }
                        if (filteredObjs.length === 1) {
                            preparedData.push(filteredObjs[0]);
                        }
                    }, this);
                }, this);
            }, this);

            if (isMonthsSelected) {
                preparedData.forEach(function (obj) {
                    obj.date = obj.year + this.mapMonth(obj.month);
                }, this);
            }
            else {
                //todo aggregiere alle monate auf das jahr
            }
            preparedData = this.mergeByAttribute(preparedData, "date", attrName);
            preparedData = this.addNullValues(preparedData, bezirke);
            preparedData = Radio.request("Util", "sort", preparedData, "date");
            return preparedData;
        },
        addNullValues: function (data, bezirke) {
            data.forEach(function (obj) {
                bezirke.forEach(function (value) {
                    if (obj[value] === undefined) {
                        obj[value] = 0;
                    }
                });
            });
            return data;
        },
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
                    const bezirk = obj.bezirk;

                    mergedObj[bezirk] = obj[mergeAttr];
                });
                mergedData.push(mergedObj);
            });

            return mergedData;
        },
        aggregateByValues: function (data, condition, attrName) {
            const conditionAttribute = condition.attributeName,
                conditionValues = condition.values,
                prefilteredData = this.filterByAttribute(data, conditionValues, conditionAttribute),
                aggregate = prefilteredData[0];

            prefilteredData.forEach(function (obj, index) {
                if (index > 0) {
                    const objHasValue = conditionValues.includes(obj[conditionAttribute]);

                    if (objHasValue) {
                        aggregate[attrName] = aggregate[attrName] + obj[attrName];
                    }
                }
            });
            // aggregate[conditionAttribute] = undefined;
            return [aggregate];
        },
        mapMonth: function (month) {
            switch (month) {
                case "Januar": {
                    return "01";
                }
                case "Februar": {
                    return "02";
                }
                case "März": {
                    return "03";
                }
                case "April": {
                    return "04";
                }
                case "Mai": {
                    return "05";
                }
                case "Juni": {
                    return "06";
                }
                case "Juli": {
                    return "07";
                }
                case "August": {
                    return "08";
                }
                case "September": {
                    return "09";
                }
                case "Oktober": {
                    return "10";
                }
                case "November": {
                    return "11";
                }
                case "Dezember": {
                    return "12";
                }
                default: {
                    return "";
                }
            }
        },
        createGraph: function (data, selector, selectorTooltip, attributes, xAttr) {
            const graphConfig = {
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
                xAxisLabel: {
                    label: "Jahre",
                    translate: 20
                },
                yAxisLabel: {
                    label: "Anzahl",
                    offset: 10
                },
                attrToShowArray: attributes,
                legendData: []
            };

            Radio.trigger("Graph", "createGraph", graphConfig);
        }
    });
    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
