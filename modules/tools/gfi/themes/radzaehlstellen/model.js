import Theme from "../model";
import ImgView from "../../objects/image/view";
import * as moment from "moment";

const RadzaehlstellenTheme = Theme.extend({
    defaults: _.extend({}, Theme.prototype.defaults,
        {
            dayDataset: null,
            lastSevenDaysDataset: null,
            yearDataset: null,
            activeTab: "info",
            size: {},
            downloadData: []
        }),
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithChildObjects();
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
        var element = this.get("gfiContent"),
            children = [];

        if (!_.isString(element)) {
            _.each(element, function (ele, index) {
                _.each(ele, function (val, key) {
                    var copyright,
                        imgView,
                        valString = String(val);

                    if (valString.substr(0, 4) === "http"
                        && (valString.search(/\.jpg/i) !== -1 || valString.search(/\.png/i) !== -1 || valString.search(/\.jpeg/i) !== -1 || valString.search(/\.gif/i) !== -1)) {
                        // Prüfen, ob es auch ein Copyright für das Bild gibt, dann dieses ebenfalls an ImgView übergeben, damit es im Bild dargestellt wird
                        copyright = "";

                        if (!_.isUndefined(element[index].Copyright) && element[index].Copyright !== null) {
                            copyright = element[index].Copyright;
                            element[index].Copyright = "#";
                        }
                        else if (!_.isUndefined(element[index].copyright) && element[index].copyright !== null) {
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
                    element[index] = _.omit(element[index], function (value) {
                        return value === "#";
                    });
                }, this);
            });
        }
        if (children.length > 0) {
            this.set("children", children);
        }
        this.set("gfiContent", element);
    },
    /**
     * ParseGfiContent parses the gfiContent into several variables for the graphics and for the info tab.
     * @return {void}
     */
    parseGfiContent: function () {
        var gfiContent,
            dayLine,
            lastSevenDaysLine,
            yearLine,
            infoGFIContent,
            preparedInfoGFIContent = [];

        if (!_.isUndefined(this.get("gfiContent"))) {
            gfiContent = this.get("gfiContent")[0];
            infoGFIContent = _.omit(gfiContent, ["Tageslinie", "Wochenlinie", "Jahrgangslinie", "Name"]);
            dayLine = _.has(gfiContent, "Tageslinie") ? gfiContent.Tageslinie : null;
            lastSevenDaysLine = _.has(gfiContent, "Wochenlinie") ? gfiContent.Wochenlinie : null;
            yearLine = _.has(gfiContent, "Jahrgangslinie") ? gfiContent.Jahrgangslinie : null;

            _.each(infoGFIContent, function (attribute, key) {
                var gfiAttributes,
                    isnum,
                    editedAttribute;

                if (attribute.indexOf("|") !== -1) {
                    isnum = new RegExp(/^\d+$/).test(attribute.split("|")[1]);
                    editedAttribute = attribute.split("|");
                    if (isnum === true) {
                        editedAttribute[1] = Radio.request("Util", "punctuate", editedAttribute[1]);
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
                this.prepareDayDataset(this.splitDayDataset(dayLine));
            }

            if (lastSevenDaysLine) {
                this.prepareLastSevenDaysDataset(this.splitLastSevenDaysDataset(lastSevenDaysLine));
            }

            if (yearLine) {
                this.prepareYearDataset(this.splitYearDataset(yearLine));
            }
            this.setInfoGFIContent(preparedInfoGFIContent);
        }
    },

    /**
     * splitDayDataset creates a json for the graphic module with the dayLine data.
     * @param  {string} dayLine contains the dayLine data of gfiContent
     * @return {array} tempArr array with prepared objects of the data
     */
    splitDayDataset: function (dayLine) {
        var dataSplit = dayLine.split("|"),
            tempArr = [];

        _.each(dataSplit, function (data) {
            var splitted = data.split(","),
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
                timestamp: new Date(year, month, day, hours, minutes, seconds, 0),
                total: total,
                r_in: r_in,
                r_out: r_out
            });
        });
        return _.sortBy(tempArr, "timestamp");
    },

    /**
     * splitLastSevenDaysDataset creates a json for the graphic module with the lastSevenDaysLine data.
     * @param  {string} lastSevenDaysLine contains the lastSevenDays data of gfiContent
     * @return {array} tempArr array with prepared objects of the data
     */
    splitLastSevenDaysDataset: function (lastSevenDaysLine) {
        var dataSplit = lastSevenDaysLine.split("|"),
            tempArr = [];

        _.each(dataSplit, function (data) {
            var splitted = data.split(","),
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
                r_in: r_in,
                r_out: r_out
            });
        });

        return _.sortBy(tempArr, "timestamp");
    },


    /**
     * splitYearDataset creates a json for the graphic module with the yearLine data.
     * @param  {string} yearLine contains the year data of gfiContent
     * @return {array} tempArr array with prepared objects of the data
     */
    splitYearDataset: function (yearLine) {
        var dataSplit = yearLine.split("|"),
            tempArr = [];

        _.each(dataSplit, function (data) {
            var splitted = data.split(","),
                weeknumber = splitted[1],
                year = splitted[0],
                total = parseFloat(splitted[2]),
                r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            tempArr.push({
                class: "dot",
                style: "circle",
                timestamp: moment().day("Monday").year(year).week(weeknumber).toDate(),
                total: total,
                r_in: r_in,
                r_out: r_out
            });
        });

        return _.sortBy(tempArr, "timestamp");
    },

    /**
     * prepareDayDataset creates an object for  the dayDataset
     * @param {array} data array of objects from dayLineData
     * @returns {void}
     */
    prepareDayDataset: function (data) {
        var datum = moment(data[0].timestamp).format("DD.MM.YYYY"),
            graphArray = this.getDataAttributes(data[0]),
            newData = _.map(data, function (val) {
                val.timestamp = moment(val.timestamp).format("HH:mm") + " Uhr";
                return val;
            }),
            legendArray = this.getLegendAttributes(data[0]);

        this.setDayDataset({
            data: newData,
            xLabel: "Tagesverlauf am " + datum,
            graphArray: graphArray,
            xAxisTickValues: this.createxAxisTickValues(data, 6),
            legendArray: legendArray
        });
    },

    /**
     * prepareLastSevenDaysDataset creates an object for  the lastSevenDaysDataset
     * @param {array} data array of objects from lastSevenDaysLineData
     * @returns {void}
     */
    prepareLastSevenDaysDataset: function (data) {
        var startDatum = moment(data[0].timestamp).format("DD.MM.YYYY"),
            endeDatum = moment(_.last(data).timestamp).format("DD.MM.YYYY"),
            graphArray = this.getDataAttributes(data[0]),
            newData = _.map(data, function (val) {
                val.timestamp = moment(val.timestamp).format("DD.MM.YYYY");
                return val;
            }),
            legendArray = this.getLegendAttributes(data[0]);

        this.setLastSevenDaysDataset({
            data: newData,
            xLabel: "Woche vom " + startDatum + " bis " + endeDatum,
            graphArray: graphArray,
            xAxisTickValues: this.createxAxisTickValues(data, 1),
            legendArray: legendArray
        });
    },

    /**
     * prepareYearDataset creates an object for the yearDataset
     * @param {array} data array of objects from yearLineData
     * @returns {void}
     */
    prepareYearDataset: function (data) {
        var year = moment(data[0].timestamp).format("YYYY"),
            graphArray = this.getDataAttributes(data[0]),
            newData = _.each(data, function (val) {
                val.timestamp = moment(val.timestamp).format("w");
                return val;
            }),
            legendArray = this.getLegendAttributes(data[0]);

        this.setYearDataset({
            data: newData,
            xLabel: "KW im Jahr " + year,
            graphArray: graphArray,
            xAxisTickValues: this.createxAxisTickValues(data, 5),
            legendArray: legendArray
        });
    },

    /**
     * getDataAttributes returns an array of key values.
     * @param  {object} inspectData contains the first row of the dataset
     * @return {array} showData array with key values
     */
    getDataAttributes: function (inspectData) {
        var showData = ["total"];

        if (!_.isNull(inspectData.r_in)) {
            showData.push("r_in");
        }
        if (!_.isNull(inspectData.r_out)) {
            showData.push("r_out");
        }

        return showData;
    },

    /**
     * getLegendAttributes returns an array for the graphic legend
     * @param  {object} inspectData contains the first row of the dataset
     * @return {array}             [description]
     */
    getLegendAttributes: function (inspectData) {
        var legendData = [{
            class: "dot",
            text: "Fahrräder insgesamt",
            style: "circle"
        }];

        if (!_.isNull(inspectData.r_in)) {
            legendData.push({
                key: "r_in",
                value: "Fahrräder stadteinwärts"
            });
        }

        if (!_.isNull(inspectData.r_out)) {
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
     * @param  {string} activeTab contains the value of the active tab
     * @return {void}
     */
    createD3Document: function (activeTab) {
        var dataset = this.getDatasetByActiveTab(activeTab),
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
                xAxisTickValues: dataset.xAxisTickValues,
                xAxisLabel: {
                    label: dataset.xLabel
                },
                yAxisLabel: {
                    label: "Anzahl Fahrräder",
                    offset: 10
                },
                attrToShowArray: dataset.graphArray,
                legendData: dataset.legendArray
            };

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * getDatasetByActiveTab returns the dataset object for the active tab
     * @param  {string} activeTab contains the value of the active tab
     * @return {object} dataset returns an object of the prepaired dataset for the active tab
     */
    getDatasetByActiveTab: function (activeTab) {
        var dataset;

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

    /**
     * createDownloadContent get the dataset for the active tab and pass it to the setter function
     * @param  {string} activeTab contains the value of the active tab
     * @return {void}
     */
    createDownloadContent: function (activeTab) {
        var activeTabData;

        if (activeTab === "day") {
            activeTabData = this.get("dayDataset").data;
        }
        else if (activeTab === "lastSevenDays") {
            activeTabData = this.get("lastSevenDaysDataset").data;
        }
        else if (activeTab === "year") {
            activeTabData = this.get("yearDataset").data;
        }

        this.setDownloadData(this.createDownloadFeature(activeTabData));

    },

    /**
     * createDownloadFeature prepares the features for the csv download
     * @param  {array} dataset contains the dataset of the active tab
     * @return {array} dataArray array with the dataset object
     */
    createDownloadFeature: function (dataset) {
        var dataObject = {
                "Name": this.get("gfiContent")[0].Name
            },
            dataArray = [];

        _.each(dataset, function (ele) {
            dataObject[ele.timestamp] = ele.total;
        });
        dataArray.push(dataObject);
        return dataArray;
    },

    /**
     * download execute the csv download
     * @return {void}
     */
    download: function () {
        const featureArray = this.get("downloadData");

        let csv = "",
            blob = "";

        csv = Radio.request("Util", "convertArrayOfObjectsToCsv", featureArray, ";");
        blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, "export.csv");
        }
        else {
            const link = document.createElement("a");

            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);

                link.setAttribute("href", url);
                link.setAttribute("download", "export.csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    },

    /**
     * createxAxisTickValues returns an array of the tick values for the graph module
     * @param  {array} data array of objects from dayLineData
     * @param  {integer} xThinning number for the distance between the ticks
     * @return {array} tickValuesArray array of the tick values
     */
    createxAxisTickValues: function (data, xThinning) {
        var tickValuesArray = [],
            startsWith = 0,
            xThinningVal = xThinning;

        _.each(data, function (ele) {
            tickValuesArray.push(ele.timestamp);
        });
        tickValuesArray = _.filter(tickValuesArray, function (d, i) {
            var val;

            if (d === "1") {
                startsWith = 1;
                val = i;
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

    // setter for activeTab
    setActiveTab: function (value) {
        this.set("activeTab", value);
    },

    // setter for infoGFIContent
    setInfoGFIContent: function (value) {
        this.set("infoGFIContent", value);
    },

    // setter for downloadData
    setDownloadData: function (value) {
        this.set("downloadData", value);
    },

    // setter for setSize
    setSize: function (value) {
        this.set("size", value);
    },

    // setter for dayDataset
    setDayDataset: function (value) {
        this.set("dayDataset", value);
    },

    // setter for lastSevenDaysDataset
    setLastSevenDaysDataset: function (value) {
        this.set("lastSevenDaysDataset", value);
    },

    // setter for yearDataset
    setYearDataset: function (value) {
        this.set("yearDataset", value);
    }
});

export default RadzaehlstellenTheme;
