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
                "monthMode": true
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
            this.requestJson();
        },
        prepareDataForGraph: function () {
            const years = this.get("filterObject").years.sort(),
                districts = this.get("filterObject").districts,
                isMonthsSelected = this.get("filterObject").monthMode,
                data = this.get("data"),
                filteredData = this.filterData(data, districts, years),
                dataBaugenehmigungen = this.prepareData(filteredData, districts, years, isMonthsSelected, "bauvorhaben", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheiten = this.prepareData(filteredData, districts, years, isMonthsSelected, "wohneinheiten", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheitenNochNichtImBau = this.prepareData(filteredData, districts, years, isMonthsSelected, "wohneinheiten", {attributeName: "constructionStarted", values: [false]}),
                dataWohneinheitenImBau = this.prepareData(filteredData, districts, years, isMonthsSelected, "wohneinheiten", {attributeName: "constructionStarted", values: [true]}),
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
                this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", ".graph-tooltip-div-1", attributesToShow, "date");
                this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-tooltip-div-2", attributesToShow, "date");
                this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneineinheiten-noch-nicht-im-bau", ".graph-tooltip-div-3", attributesToShow, "date");
                this.createGraph(dataWohneinheitenImBau, ".graph-wohneineinheiten-im-bau", ".graph-tooltip-div-4", attributesToShow, "date");
            }
        },
        filterData: function (data, districts, years) {
            const filteredDataByBezirk = this.filterByAttribute(data, districts, "bezirk"),
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
        prepareData: function (data, districts, years, isMonthsSelected, attrName, condition) {
            var preparedData = [],
                months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

            districts.forEach(function (bezirk) {
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
            preparedData = this.addNullValues(preparedData, districts);
            preparedData = Radio.request("Util", "sort", preparedData, "date");
            return preparedData;
        },
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
                    mergedObj.class = "dot";
                    mergedObj.style = "circle";
                });
                mergedData.push(mergedObj);
            });

            return mergedData;
        },
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
        createGraph: function (data, selector, selectorTooltip, attributesToShow, xAttr) {
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
                attrToShowArray: attributesToShow,
                legendData: []
            };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },

        requestJson: function () {
            $.ajax({
                // url: Radio.request("Util", "getProxyURL", "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/cockpit_bauvorhaben.json"),
                url: "https://test.geoportal-hamburg.de/lgv-config/cockpit_bauvorhaben.json",
                context: this,
                success: function (data) {
                    this.filterYears(data);
                    this.filterDistricts(data);
                    this.setData(data);
                    this.trigger("render");
                }
            });
        },

        filterYears: function (data) {
            const t = data.map(function (obj) {
                return obj.year;
            });

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        filterDistricts: function (data) {
            const t = data.map(function (obj) {
                return obj.bezirk;
            });

            this.setDistricts([...new Set(t)].sort());
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
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
