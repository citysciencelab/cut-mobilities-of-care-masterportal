import Theme from "../model";
import "../../../graph/model";

const VerkehrsStaerkenTheme = Theme.extend({
    defaults: _.extend({}, Theme.prototype.defaults,
        {
            ansicht: "Diagrammansicht",
            link: "http://daten-hamburg.de/transport_verkehr/verkehrsstaerken/DTV_DTVw_Download.xlsx",
            zaehlstelle: "",
            bezeichnung: "",
            art: "",
            years: [],
            rowNames: [],
            dataset: []
        }),
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        });
    },
    /**
     * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
     * @returns {void}
     */
    parseGfiContent: function () {
        var gfiContent,
            rowNames,
            newRowNames = [],
            yearData,
            dataPerYear = [],
            year,
            years = [];

        if (_.isUndefined(this.get("gfiContent")) === false) {
            gfiContent = this.get("gfiContent")[0];
            rowNames = _.keys(this.get("gfiContent")[0]);

            _.each(rowNames, function (rowName) {
                var newRowName, index, yearDigits, charBeforeYear;

                year = parseInt(rowName.slice(-4), 10);

                if (rowName === "Zählstelle") {
                    this.setZaehlstelle(gfiContent[rowName]);
                }
                else if (rowName === "Bezeichnung") {
                    this.setBezeichnung(gfiContent[rowName]);
                }
                else if (rowName === "Art") {
                    this.setArt(gfiContent[rowName]);
                }
                // jahresDatensätze parsen
                else if (!_.isNaN(year)) {
                    newRowName = "";
                    index = rowName.indexOf(String(year)) - 1;
                    yearDigits = rowName.slice(-4).length;
                    charBeforeYear = rowName.slice(index, -yearDigits);

                    // vorzeichen vor year prüfen
                    if (charBeforeYear === "_") {
                        newRowName = rowName.replace("_" + String(year), "").trim();
                    }
                    else {
                        newRowName = rowName.replace(" " + String(year), "").trim();
                    }
                    yearData = {
                        year: year,
                        attrName: newRowName,
                        value: gfiContent[rowName]
                    };
                    dataPerYear.push(yearData);
                    newRowNames.push(newRowName);
                    years.push(year);
                }
            }, this);
            newRowNames = _.unique(newRowNames);
            years = _.unique(years);
            this.setYears(years);
            this.setRowNames(newRowNames);
            this.combineYearsData(dataPerYear, years);
        }
    },

    combineYearsData: function (dataPerYear, years) {
        var dataset = [];

        _.each(years, function (year) {
            var attrDataArray = _.where(dataPerYear, {year: year}),
                yearObject = {year: year};

            _.each(attrDataArray, function (attrData) {
                yearObject[attrData.attrName] = attrData.value;
            }, this);
            dataset.push(yearObject);
        }, this);
        dataset = this.parseData(dataset);
        this.setDataset(dataset);
    },
    // setter for rowNames
    setRowNames: function (value) {
        this.set("rowNames", value);
    },
    // setter for years
    setYears: function (value) {
        this.set("years", value);
    },
    // setter for art
    setArt: function (value) {
        this.set("art", value);
    },
    // setter for bezeichnung
    setBezeichnung: function (value) {
        this.set("bezeichnung", value);
    },
    // setter for zaehlstelle
    setZaehlstelle: function (value) {
        this.set("zaehlstelle", value);
    },
    setDataset: function (value) {
        this.set("dataset", value);
    },
    /**
     * Alle children und Routable-Button (alles Module) im gfiContent müssen hier removed werden.
     * @returns {void}
     */
    destroy: function () {
        _.each(this.get("gfiContent"), function (element) {
            var children;

            if (_.has(element, "children")) {
                children = _.values(_.pick(element, "children"))[0];

                _.each(children, function (child) {
                    child.val.remove();
                }, this);
            }
        }, this);
        _.each(this.get("gfiRoutables"), function (element) {
            if (_.isObject(element) === true) {
                element.remove();
            }
        }, this);
    },
    /*
    * noData comes as "-" from WMS. turn noData into ""
    * try to parse data to float
    */
    parseData: function (dataArray) {
        var parsedDataArray = [];

        _.each(dataArray, function (dataObj) {
            var parsedDataObj = {
                class: "dot",
                style: "circle"
            };

            _.each(dataObj, function (dataVal, dataAttr) {
                var parseDataVal = this.parseDataValue(dataVal),
                    parseFloatVal = parseFloat(parseDataVal);

                if (dataAttr === "Baustelleneinfluss") {
                    parsedDataObj.class = "dot_visible";
                    parsedDataObj.style = "rect";
                }
                else if (isNaN(parseFloatVal)) {
                    parsedDataObj[dataAttr] = parseDataVal;
                }
                else {
                    parsedDataObj[dataAttr] = parseFloatVal;
                }

            }, this);
            parsedDataArray.push(parsedDataObj);
        }, this);

        return parsedDataArray;
    },

    parseDataValue: function (value) {
        if (value === "*") {
            return "Ja";
        }
        return value;
    },

    /**
     * Ermittelt die Bezeichnung und das Styling der Legendeneinträge
     * @param   {string}    value   Art
     * @returns {Object[]}          Legendendefinitionen
     */
    legendData: function (value) {
        var attr = [];

        if (value === "DTV") {
            attr.push({
                text: "DTV (Kfz/24h)",
                class: "dot",
                style: "circle"
            });
        }
        else if (value === "DTVw") {
            attr.push({
                text: "DTVw (Kfz/24h)",
                class: "dot",
                style: "circle"
            });
        }
        else {
            attr.push({
                text: "SV-Anteil am DTVw (%)",
                class: "dot",
                style: "circle"
            });
        }

        attr.push({
            text: "mit Baustelleneinfluss",
            class: "dot_visible",
            style: "rect"
        });

        return attr;
    },

    /**
     * Gibt die Bezeichnung der y-Achse zurück
     * @param   {string} value  Art
     * @returns {string}        Bezeichnung der y-Achse
     */
    yAxisLabel: function (value) {
        if (value === "DTV") {
            return "DTV (Kfz/24h)";
        }
        else if (value === "DTVw") {
            return "DTVw (Kfz/24h)";
        }
        return "SV-Anteil am DTVw (%)";
    },

    createD3Document: function (key) {
        var heightTabContent = parseInt($(".verkehrsstaerken .tab-content").css("height").slice(0, -2), 10),
            heightBtnGroup = parseInt($(".verkehrsstaerken #diagramm .btn-group").css("height").slice(0, -2), 10) + parseInt($(".verkehrsstaerken #diagramm .btn-group").css("padding-top").slice(0, -2), 10) + parseInt($(".verkehrsstaerken #diagramm .btn-group").css("padding-bottom").slice(0, -2), 10),
            height = heightTabContent - heightBtnGroup,
            width = parseInt($(".verkehrsstaerken .tab-content").css("width").slice(0, -2), 10),
            graphConfig = {
                legendData: this.legendData(key),
                graphType: "Linegraph",
                selector: ".graph",
                width: width,
                height: height,
                margin: {top: 20, right: 20, bottom: 75, left: 70},
                svgClass: "graph-svg",
                selectorTooltip: ".graph-tooltip-div",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                yAxisTicks: {
                    ticks: 7,
                    factor: ",f"
                },
                data: this.get("dataset"),
                xAttr: "year",
                xAxisLabel: {
                    label: "Jahr"
                },
                yAxisLabel: {
                    label: this.yAxisLabel(key),
                    offset: 10
                },
                attrToShowArray: [key]
            };

        Radio.trigger("Graph", "createGraph", graphConfig);
    }
});

export default VerkehrsStaerkenTheme;
