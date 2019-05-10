import Theme from "../model";
import "../../../graph/model";

const VerkehrsStaerkenThemeModel = Theme.extend(/** @lends VerkehrsStaerkenThemeModel.prototype */{
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
    /**
     * @class VerkehrsStaerkenThemeModel
     * @extends Theme
     * @memberof Tools.GFI.Themes.VerkehrsStaerken
     * @constructs
     * @property {String} ansicht="Diagrammansicht" Mode of View to be displayed.
     * @property {String} link="http://daten-hamburg.de/transport_verkehr/verkehrsstaerken/DTV_DTVw_Download.xlsx" Download link for data.
     * @property {String} zaehlstelle="" Id of current counting station.
     * @property {String} bezeichnung="" Name of current counting station.
     * @property {String} art="" Type of counting station.
     * @property {Number[]} years=[] Array of years to be shown.
     * @property {String[]} rowNames=[] Array of row names.
     * @property {Object[]} dataset=[] Parsed dataset with all the information needed for table and diagram.
     * @listens Theme#changeIsReady
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        });
    },
    /**
     * Parses the gfi content and prepares the dataset.
     * Extracts the year and the row names
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
                var newRowName;

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
                    newRowName = this.createNewRowName(rowName, year);
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

    /**
     * Removes the year from the end of the rowName.
     * After that if the last character is a " " or a "_", this also gets removed
     * @param {String} rowName Name of Row from gfiContent
     * @param {String/Number} year Year
     * @returns {String} - New row name withour the year at the end
     */
    createNewRowName: function (rowName, year) {
        var newRowName = "",
            yearAsString = String(year),
            index = rowName.indexOf(yearAsString) - 1,
            yearDigits = rowName.slice(-4).length,
            charBeforeYear = rowName.slice(index, -yearDigits);

        if (charBeforeYear === "_") {
            newRowName = rowName.replace("_" + yearAsString, "").trim();
        }
        else {
            newRowName = rowName.replace(" " + yearAsString, "").trim();
        }

        return newRowName;
    },
    /**
     * Prepares the Dataset and sets it directly in the model
     * @param {Object[]} dataPerYear Array of objects containing the data by year.
     * @param {Number[]} years Array of available years
     * @returns {void}
     */
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
     * Removes all children and routables
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
    * Parses the data and prepares them for creating the table or the graph.
    * Creates new attributes in data objects.
    * Tries to parse data to float.
    * @returns {Object[]} - parsed data.
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
                if (isNaN(parseFloatVal)) {
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

    /**
     * Maps the string "*" to "Ja".
     * If not, returnes the original value.
     * @param {String} value Input string.
     * @returns {String} - The mapped string.
     */
    parseDataValue: function (value) {
        if (value === "*") {
            return "Ja";
        }
        return value;
    },

    /**
     * Creates the definitions for the diagrams legend
     * @param   {string} value Attribute value
     * @returns {Object[]} - Definitions for diagram legend
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
     * Mapping of the the y-axis name
     * @param   {String} value  Value
     * @returns {String} - Mapped y-axis name
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

    /**
     * Generates the graph config and triggers the Graph-functionality to create the graph
     * @param {String} key Name of category
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
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
                    label: "Jahr",
                    translate: 6
                },
                yAxisLabel: {
                    label: this.yAxisLabel(key),
                    offset: 60
                },
                attrToShowArray: [key]
            };

        Radio.trigger("Graph", "createGraph", graphConfig);
    }
});

export default VerkehrsStaerkenThemeModel;
