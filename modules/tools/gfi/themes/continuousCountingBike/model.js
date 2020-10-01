import Theme from "../model";
import ImgView from "../../objects/image/view";
import * as moment from "moment";

const ContinuousCountingBikeTheme = Theme.extend(/** @lends ContinuousCountingBikeTheme.prototype */{
    defaults: Object.assign({}, Theme.prototype.defaults,
        {
            dayDataset: {},
            lastSevenDaysDataset: {},
            yearDataset: {},
            activeTab: "info",
            downloadLink: ""
        }),
    /**
     * @class ContinuousCountingBikeTheme
     * @extends Theme
     * @memberof Tools.GFI.Themes.ContinuousCountingBikeTheme
     * @constructs
     * @property {Object} dayDataset={} Empty object for the dataset of yesterday
     * @property {Object} lastSevenDaysDataset={} Empty object for the dataset of the last seven days
     * @property {Object} yearDataset={} Empty object for the dataset of the current year
     * @property {String} activeTab="info" Contains the name of the active tab
     * @property {String} downloadLink="" Link for the download data
     * @fires Util#RadioRequestUtilThousandsSeparator
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     * @listens Theme#changeIsReady
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                this.parseGfiContent();
            }
        });
    },
    /**
     * ReplaceValuesWithChildObjects checks the gfiContent if there are attributes with links to images like jpg/jpeg/png/gif.
     * These attributes will be taken out of gfiContent and hand over to the object image view to prepare templates.
     * These templates are pushed into the children Array which will be handled in the view.
     * @return {void}
     */
    replaceValuesWithChildObjects: function () {
        const element = this.get("gfiContent"),
            children = [];

        if (typeof element !== "string") {
            element.forEach((ele, index) => {
                Object.entries(ele).forEach(oneElement => {
                    const value = oneElement[1],
                        key = oneElement[0],
                        valString = String(value);
                    let copyright,
                        imgView;

                    if (valString.substr(0, 4) === "http"
                        && (valString.search(/\.jpg/i) !== -1 || valString.search(/\.png/i) !== -1 || valString.search(/\.jpeg/i) !== -1 || valString.search(/\.gif/i) !== -1)) {
                        // Prüfen, ob es auch ein Copyright für das Bild gibt, dann dieses ebenfalls an ImgView übergeben, damit es im Bild dargestellt wird
                        copyright = "";

                        if (element[index].Copyright !== undefined && element[index].Copyright !== null) {
                            copyright = element[index].Copyright;
                            element[index].Copyright = "#";
                        }
                        else if (element[index].copyright !== undefined && element[index].copyright !== null) {
                            copyright = element[index].copyright;
                            element[index].copyright = "#";
                        }

                        imgView = new ImgView(valString, copyright);

                        element[index][key] = "#";

                        children.push({
                            key: key,
                            val: imgView,
                            type: "image"

                        });
                    }

                    // lösche leere Dummy-Einträge wieder raus.
                    Radio.request("Util", "omit", element[index], ["#"]);
                });
            });
        }
        if (children.length > 0) {
            this.set("children", children);
        }
        this.set("gfiContent", element);
    },
    /**
     * ParseGfiContent parses the gfiContent into several variables for the graphics and for the info tab.
     * @fires Util#event:RadioRequestUtilThousandsSeparator
     * @return {void}
     */
    parseGfiContent: function () {
        const preparedInfoGFIContent = [];
        let gfiContent,
            dayLine,
            lastSevenDaysLine,
            yearLine,
            infoGFIContent;

        if (this.get("gfiContent") !== undefined) {
            gfiContent = this.get("gfiContent")[0];
            infoGFIContent = Radio.request("Util", "omit", gfiContent, ["Tageslinie", "Wochenlinie", "Jahrgangslinie", "Name", "Typ", "Download"]);
            dayLine = gfiContent.hasOwnProperty("Tageslinie") ? gfiContent.Tageslinie : null;
            lastSevenDaysLine = gfiContent.hasOwnProperty("Wochenlinie") ? gfiContent.Wochenlinie : null;
            yearLine = gfiContent.hasOwnProperty("Jahrgangslinie") ? gfiContent.Jahrgangslinie : null;
            this.setDownloadLink(gfiContent.hasOwnProperty("Download") ? gfiContent.Download : null);
            Object.entries(infoGFIContent).forEach(content => {
                const attribute = content[1],
                    key = content[0];
                let gfiAttributes,
                    isnum,
                    editedAttribute,
                    strongestFrequentedMonth;

                if (attribute.indexOf("|") !== -1) {
                    isnum = new RegExp(/^\d+$/).test(attribute.split("|")[1]);
                    editedAttribute = attribute.split("|");
                    if (isnum === true) {
                        editedAttribute[1] = Radio.request("Util", "thousandsSeparator", editedAttribute[1]);
                    }
                    if (key === "Stärkster Monat im Jahr") {
                        strongestFrequentedMonth = new Date(2019, editedAttribute[0] - 1);
                        editedAttribute[0] = moment(strongestFrequentedMonth, "month", "de").format("MMMM");
                    }
                    gfiAttributes = {
                        attrName: key,
                        attrValue: editedAttribute
                    };
                }
                else {
                    gfiAttributes = {
                        attrName: key,
                        attrValue: attribute
                    };
                }
                preparedInfoGFIContent.push(gfiAttributes);
            });
            if (dayLine) {
                this.setDayDataset(this.prepareDayDataset(this.splitDayDataset(dayLine)));
            }

            if (lastSevenDaysLine) {
                this.setLastSevenDaysDataset(this.prepareLastSevenDaysDataset(this.splitLastSevenDaysDataset(lastSevenDaysLine)));
            }

            if (yearLine) {
                this.setYearDataset(this.prepareYearDataset(this.splitYearDataset(yearLine)));
            }
            this.setInfoGFIContent(preparedInfoGFIContent);
        }
    },

    /**
     * splitDayDataset creates a json for the graphic module with the dayLine data.
     * @param  {String} dayLine contains the dayLine data of gfiContent
     * @fires Util#event:RadioRequestUtilThousandsSeparator
     * @return {Array} tempArr array with prepared objects of the data
     */
    splitDayDataset: function (dayLine) {
        const dataSplit = dayLine ? dayLine.split("|") : "",
            tempArr = [];

        dataSplit.forEach(data => {
            const splitted = data.split(","),
                day = splitted[0].split(".")[0],
                month = splitted[0].split(".")[1] - 1,
                year = splitted[0].split(".")[2],
                hours = splitted[1].split(":")[0],
                minutes = splitted[1].split(":")[1],
                seconds = splitted[1].split(":")[2],
                total = parseFloat(splitted[2]),
                r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            tempArr.push({
                class: "dot",
                style: "circle",
                date: splitted[0],
                timestamp: new Date(year, month, day, hours, minutes, seconds, 0),
                total: total,
                tableData: Radio.request("Util", "thousandsSeparator", total),
                r_in: r_in,
                r_out: r_out
            });
        });
        return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
    },

    /**
     * splitLastSevenDaysDataset creates a json for the graphic module with the lastSevenDaysLine data.
     * @param  {String} lastSevenDaysLine contains the lastSevenDays data of gfiContent
     * @fires Util#event:RadioRequestUtilThousandsSeparator
     * @return {Array} tempArr array with prepared objects of the data
     */
    splitLastSevenDaysDataset: function (lastSevenDaysLine) {
        const dataSplit = lastSevenDaysLine ? lastSevenDaysLine.split("|") : "",
            tempArr = [];

        dataSplit.forEach(data => {
            const splitted = data.split(","),
                // weeknumber = splitted[0],
                day = splitted[1].split(".")[0],
                month = splitted[1].split(".")[1] - 1,
                year = splitted[1].split(".")[2],
                total = parseFloat(splitted[2]),
                r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            tempArr.push({
                class: "dot",
                style: "circle",
                timestamp: new Date(year, month, day, 0, 0, 0, 0),
                total: total,
                tableData: Radio.request("Util", "thousandsSeparator", total),
                r_in: r_in,
                r_out: r_out
            });
        });

        return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
    },


    /**
     * splitYearDataset creates a json for the graphic module with the yearLine data.
     * @param  {String} yearLine contains the year data of gfiContent
     * @fires Util#event:RadioRequestUtilThousandsSeparator
     * @return {Array} tempArr array with prepared objects of the data
     */
    splitYearDataset: function (yearLine) {
        const dataSplit = yearLine ? yearLine.split("|") : "",
            tempArr = [];

        dataSplit.forEach(data => {
            const splitted = data.split(","),
                weeknumber = splitted[1],
                year = splitted[0],
                total = parseFloat(splitted[2]),
                r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            tempArr.push({
                class: "dot",
                style: "circle",
                timestamp: moment().day("Monday").year(year).week(weeknumber).toDate(),
                year: year,
                total: total,
                tableData: Radio.request("Util", "thousandsSeparator", total),
                r_in: r_in,
                r_out: r_out
            });
        });

        return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
    },

    /**
     * prepareDayDataset creates an object for  the dayDataset
     * @param {Array} data array of objects from dayLineData
     * @returns {void}
     */
    prepareDayDataset: function (data) {
        const date = data ? moment(data[0].timestamp).format("DD.MM.YYYY") : "",
            graphArray = data ? this.getDataAttributes(data[0]) : "",
            newData = data ? data.map(val => {
                val.timestamp = moment(val.timestamp).format("HH:mm");
                return val;
            }) : "",
            legendArray = data ? this.getLegendAttributes(data[0]) : "";

        return {
            data: newData,
            xLabel: "Tagesverlauf am " + date,
            yLabel: {
                label: "Anzahl Fahrräder/Stunde",
                offset: 60
            },
            graphArray: graphArray,
            xAxisTicks: {
                unit: "Uhr",
                values: this.createxAxisTickValues(data, 6)
            },
            legendArray: legendArray
        };
    },

    /**
     * prepareLastSevenDaysDataset creates an object for the lastSevenDaysDataset
     * @param {Array} data array of objects from lastSevenDaysLineData
     * @returns {void}
     */
    prepareLastSevenDaysDataset: function (data) {
        const startDate = data ? moment(data[0].timestamp).format("DD.MM.YYYY") : "",
            endDate = data ? moment(data.slice(-1).timestamp).format("DD.MM.YYYY") : "",
            graphArray = data ? this.getDataAttributes(data[0]) : "",
            newData = data ? data.map(val => {
                val.timestamp = moment(val.timestamp).format("DD.MM.YYYY");
                return val;
            }) : "",
            legendArray = data ? this.getLegendAttributes(data[0]) : "";

        return {
            data: newData,
            xLabel: "Woche vom " + startDate + " bis " + endDate,
            yLabel: {
                label: "Anzahl Fahrräder/Tag",
                offset: 60
            },
            graphArray: graphArray,
            xAxisTicks: {
                values: this.createxAxisTickValues(data, 1)
            },
            legendArray: legendArray
        };
    },

    /**
     * prepareYearDataset creates an object for the yearDataset
     * @param {Array} data array of objects from yearLineData
     * @returns {void}
     */
    prepareYearDataset: function (data) {
        const graphArray = data ? this.getDataAttributes(data[0]) : "",
            newData = [],
            legendArray = data ? this.getLegendAttributes(data[0]) : "",
            year = data ? data[0].year : "";

        if (data) {
            data.forEach(val => {
                val.timestamp = moment(val.timestamp).format("w");
                newData.push(val);
            });
        }

        return {
            data: newData,
            xLabel: "KW im Jahr " + year,
            yLabel: {
                label: "Anzahl Fahrräder/Woche",
                offset: 60
            },
            graphArray: graphArray,
            xAxisTicks: {
                unit: "Kw",
                values: this.createxAxisTickValues(data, 5)
            },
            legendArray: legendArray
        };
    },

    /**
     * getDataAttributes returns an array of key values.
     * @param  {Object} inspectData contains the first row of the dataset
     * @return {String[]} showData array with key values
     */
    getDataAttributes: function (inspectData) {
        const showData = ["total"];

        if (inspectData && inspectData.r_in !== null) {
            showData.push("r_in");
        }
        if (inspectData && inspectData.r_out !== null) {
            showData.push("r_out");
        }

        return showData;
    },

    /**
     * getLegendAttributes returns an array for the graphic legend
     * @param  {Object} inspectData contains the first row of the dataset
     * @return {Array} legendData contains an array of objecs for the graphic legend
     */
    getLegendAttributes: function (inspectData) {
        const legendData = [{
            class: "dot",
            text: "Fahrräder insgesamt",
            style: "circle"
        }];

        if (inspectData && inspectData.r_in !== null) {
            legendData.push({
                key: "r_in",
                value: "Fahrräder stadteinwärts"
            });
        }

        if (inspectData && inspectData.r_out !== null) {
            legendData.push({
                key: "r_out",
                value: "Fahrräder stadtauswärts"
            });
        }

        return legendData;
    },

    /**
     * createD3Document creates an object for the graph model to create the graphic
     * via radio trigger, the graphConfig object is transferred to the graph module
     * @param  {String} activeTab contains the value of the active tab
     * @fires Tools.Graph#event:RadioTriggerGraphCreateGraph
     * @return {void}
     */
    createD3Document: function (activeTab) {
        const dataset = this.getDatasetByActiveTab(activeTab),
            graphConfig = {
                graphType: "Linegraph",
                selector: ".graph",
                width: this.get("size").width,
                height: this.get("size").height,
                margin: {top: 20, right: 20, bottom: 50, left: 70},
                svgClass: "graph-svg",
                selectorTooltip: ".graph-tooltip-div",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: dataset.data,
                xAttr: "timestamp",
                xAxisTicks: dataset.xAxisTicks,
                xAxisLabel: {
                    label: dataset.xLabel,
                    translate: 20
                },
                yAxisLabel: dataset.yLabel,
                attrToShowArray: dataset.graphArray,
                legendData: dataset.legendArray
            };

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * getDatasetByActiveTab returns the dataset object for the active tab
     * @param  {String} activeTab contains the value of the active tab
     * @return {Object} dataset returns an object of the prepaired dataset for the active tab
     */
    getDatasetByActiveTab: function (activeTab) {
        let dataset;

        if (activeTab === "day") {
            dataset = this.get("dayDataset");
        }
        else if (activeTab === "lastSevenDays") {
            dataset = this.get("lastSevenDaysDataset");
        }
        else if (activeTab === "year") {
            dataset = this.get("yearDataset");
        }
        return dataset;
    },

    /**
     * destroy removes the children and the routable button
     * @return {void}
     */
    destroy: function () {
        this.get("gfiContent").forEach(element => {
            let children;

            if (element.hasOwnProperty("children")) {
                children = element.children;
                children.forEach(child => {
                    child.val.remove();
                });
            }
        });
        this.get("gfiRoutables").forEach(element => {
            if (typeof element === "object") {
                element.remove();
            }
        });
    },

    /**
     * download executes the csv download
     * @return {void}
     */
    download: function () {
        window.open(this.get("downloadLink"));
    },

    /**
     * createxAxisTickValues returns an array of the tick values for the graph module
     * @param  {Array} data array of objects from dayLineData
     * @param  {Integer} xThinning number for the distance between the ticks
     * @return {Array} tickValuesArray array of the tick values
     */
    createxAxisTickValues: function (data, xThinning) {
        let tickValuesArray = [],
            startsWith = 0,
            xThinningVal = xThinning;

        data.forEach(ele => {
            tickValuesArray.push(ele.timestamp);
        });

        tickValuesArray = tickValuesArray.filter((d, i) => {
            let val;

            if (d === "1") {
                startsWith = 1;
                val = i;
            }
            else if (i + 1 === tickValuesArray.length) {
                val = 0;
            }
            else if (tickValuesArray.length < 10) {
                val = 0;
            }
            else if (i === (xThinningVal - startsWith)) {
                val = 0;
                xThinningVal = xThinningVal + xThinning;
            }
            else {
                val = i % xThinningVal;
            }
            return !val;
        });

        return tickValuesArray;
    },

    /**
     * Setter for activeTab
     * @param {String} value Contains the active tab
     * @returns {void}
     */
    setActiveTab: function (value) {
        this.set("activeTab", value);
    },

    /**
     * Setter for infoGFIContent
     * @param {Array} value Contains the feature information for the info tab
     * @returns {void}
     */
    setInfoGFIContent: function (value) {
        this.set("infoGFIContent", value);
    },

    /**
     * Setter for setSize
     * @param {Object} value Contains an object with width and height attributes
     * @returns {void}
     */
    setSize: function (value) {
        this.set("size", value);
    },

    /**
     * Setter for dayDataset
     * @param {Object} value Contains the yesterday dataset
     * @returns {void}
     */
    setDayDataset: function (value) {
        this.set("dayDataset", value);
    },

    // setter for lastSevenDaysDataset
    /**
     * Setter for lastSevenDaysDataset
     * @param {Object} value Contains the dataset of the last seven days
     * @returns {void}
     */
    setLastSevenDaysDataset: function (value) {
        this.set("lastSevenDaysDataset", value);
    },

    // setter for yearDataset
    /**
     * Setter for yearDataset
     * @param {Object} value Contains the dataset of the current year
     * @returns {void}
     */
    setYearDataset: function (value) {
        this.set("yearDataset", value);
    },

    /**
     * Setter for downloadLink
     * @param {String} value Contains the downloadLink
     * @returns {void}
     */
    setDownloadLink: function (value) {
        this.set("downloadLink", value);
    }
});

export default ContinuousCountingBikeTheme;
