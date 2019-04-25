/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "years": [2015, 2016, 2017],
            "bezirke": ["Hamburg-Nord"],
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
                dataBaugenehmigungen = this.prepareDataForBaugenehmigungen(filteredData, bezirke, years, isMonthsSelected);
                // dataWohneinheiten = this.aggregateData(filteredData, bezirke, years, isMonthsSelected, "wohneinheiten"),
                // dataWohneinheitenNochNichtImBau = this.aggregateData(filteredData, bezirke, years, isMonthsSelected, "wohneinheiten", false),
                // dataWohneinheitenImBau = this.aggregateData(filteredData, bezirke, years, isMonthsSelected, "wohneinheiten", true);
            // filteredData = Radio.request("Util", "sort", filteredData, "year", "month");

            this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", "graph-baugenehmigungen-tooltip-div", ["bauvorhaben"], "date");
            // this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-wohneinheiten-tooltip-div", ["wohneinheiten"]);
            // this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneineinheiten-noch-nicht-im-bau", ".graph-wohneineinheiten-noch-nicht-im-bau-tooltip-div", ["wohneinheiten"]);
            // this.createGraph(dataWohneinheitenImBau, ".graph-wohneineinheiten-im-bau", ".graph-wohneineinheiten-im-bau-tooltip-div", ["wohneinheiten"]);
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
        prepareDataForBaugenehmigungen: function (filteredData, bezirke, years, isMonthsSelected) {
            let preparedData = [];

            if (isMonthsSelected) {
                filteredData.forEach(function (data) {
                    data.date = data.year + this.mapMonth(data.month);

                    preparedData.push(data);
                }, this);
            }
            console.log(preparedData);
            preparedData = Radio.request("Util", "sort", preparedData, "date");
            return preparedData;
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
                    label: "Y-Achse",
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
