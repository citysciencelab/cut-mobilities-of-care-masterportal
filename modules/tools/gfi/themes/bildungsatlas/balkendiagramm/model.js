import Theme from "../../model";

const BalkendiagrammTheme = Theme.extend({
    initialize: function () {
        const isMobile = this.checkIsMobile();
        let timeOut = 100;

        this.listenTo(this, {
            "change:isReady": function () {
                this.getStaticWithYear();
                this.getLatestStatistic();
                this.setContent();
            },
            "change:isVisible": function () {
                if (isMobile) {
                    timeOut = 300;
                }
                setTimeout(_.bind(this.createD3Document, this), timeOut);
            }
        });
    },

    /**
     * here the content will be parsed and added for the template
     * @returns {void}
     */
    setContent: function () {
        const element = this.get("gfiContent")[0],
            content = {},
            layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "balkendiagramm", "id": this.get("themeId")}),
            layerDataFormat = _.isUndefined(layerList) ? null : layerList[0].get("format");

        // get the description of this diagram
        this.set("description", layerList[0].get("description"));

        if (layerDataFormat !== null && layerDataFormat.description === "Stadtteile") {
            this.set("Title", element.Stadtteil);

            content[element.Stadtteil] = this.get("latestStatistic");
            content["Bezirk " + element.Bezirk] = element["Summe bezirk"];
            content.Hamburg = element["Summe hamburg"];

            // Check if the layer of wanderungen by the attribute description
            if (layerDataFormat.type === "anteilWanderungen") {
                content["In " + element.Stadtteil] = this.get("latestStatistic");
                content["Anteil der Zuzüge aus dem Umland:"] = element["Zuzuege aus_umland"];
                content["Anteil der Zuzüge ins Umland:"] = element["Fortzuege aus_dem_umland"];
            }
        }
        else if (layerDataFormat !== null && layerDataFormat.description === "Sozialräume") {
            this.set("Title", element["Sozialraum name"]);

            content[element["Sozialraum name"]] = this.get("latestStatistic");
            content["Bezirk " + element.Bezirk] = element["Summe bezirk"];
            content.Hamburg = element["Summe hamburg"];
        }
        else if (layerDataFormat !== null && layerDataFormat.description === "Statistische Gebiete") {
            this.set("Title", element.Stadtteil + ": " + element.Statgebiet);

            content["Statistisches Gebiet"] = this.get("latestStatistic");
            content[element.Stadtteil] = element["Summe stadtteil"];
            content["Bezirk " + element.Bezirk] = element["Summe bezirk"];
            content.Hamburg = element["Summe hamburg"];

            if (layerDataFormat.type === "anteilWanderungen") {
                content["im Statistischen Gebiet"] = this.get("latestStatistic");
            }
        }

        /**
         * get the reverted data with the right format
         */
        this.getRevertData(content, layerDataFormat, element);

        // set the layer data format
        this.set("layerDataFormat", layerDataFormat);
        this.set("layerDataFormatType", layerDataFormat.type);

        // set the content of the template
        this.set("content", content);
    },

    /**
     * Here we get the data with the year for preparaing the balkendiagram
     * @returns {void}
     */
    getStaticWithYear: function () {
        const element = this.get("gfiContent"),
            layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "balkendiagramm", "id": this.get("themeId")}),
            dataset = [],
            layerDataFormat = layerList[0].get("format");
        let key,
            year;

        for (key in element.allProperties) {
            if (key.includes("jahr_")) {
                year = key.replace("jahr_", "");
                if (layerDataFormat.category === "schule") {
                    year = Number(year.slice(-2)) + "/" + (Number(year.slice(-2)) + 1);
                }
                dataset.push({"year": year, "number": Number(element.allProperties[key])});
            }
        }

        this.setDataset(dataset);
    },

    /**
     * Revert the null or empty value to standard value
     * check if the percentage should be added
     * @param {array} content the full content of data
     * @param {object} layerDataFormat the defined format from config file
     * @param {object} element the raw data from gficontent
     * @returns {array} the content with reverted data
     */
    getRevertData: function (content, layerDataFormat, element) {
        let key = "";

        if (layerDataFormat === null) {
            return false;
        }

        for (key in content) {
            if (content[key] === null || _.isUndefined(content[key])) {
                content[key] = "*g.F.";
            }
            else if (layerDataFormat.type === "anteil") {
                content[key] = Math.round(content[key]) + "%";
            }
            else if (layerDataFormat.type === "anteilWanderungen") {
                if (key.includes("im Statistischen Gebiet") || key.includes("In " + element.Stadtteil)) {
                    content[key] = this.get("latestStatistic") > 0 ? "+" + Math.round(this.get("latestStatistic") * 100) / 100 : Math.round(this.get("latestStatistic") * 100) / 100;
                }
                else {
                    content[key] = Math.round(content[key] * 100) / 100 + "%";
                }
            }
        }

        return content;
    },

    /**
     * Here we get the data with the latest year
     * @returns {void}
     */
    getLatestStatistic: function () {
        const dataset = this.get("dataset"),
            latestStatistic = dataset.length > 1 ? dataset[dataset.length - 1].number : null;

        this.set("latestStatistic", latestStatistic);
    },

    /**
     * Generates the graph config and triggers the Graph-functionality to create the graph
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createD3Document: function () {
        const width = parseInt($(".gfi-balkendiagramm").css("width"), 10),
            dataType = this.get("layerDataFormatType"),
            themeId = this.get("themeId"),

            graphConfig = {
                graphType: "BarGraph",
                selector: ".graph_" + themeId,
                width: width - 10,
                height: 170,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 45
                },
                svgClass: "graph-svg",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                yAxisTicks: {
                    ticks: 5,
                    factor: ",f"
                },
                data: this.get("dataset"),
                xAttr: "year",
                xAxisLabel: {},
                yAxisLabel: {},

                attrToShowArray: [
                    "number"
                ],
                setTooltipValue: function (value) {
                    if (!isNaN(value) && value.toString().indexOf(".") !== -1 && dataType !== "anteilWanderungen") {
                        return Math.round(value * 100) / 100 + "%";
                    }
                    else if (value.toString().indexOf(".") !== -1) {
                        return Math.round(value * 100) / 100;
                    }

                    return value;
                }
            };

        // In case multi GFI themes come together, we need to clear the bar graph so that only one bar graph shows
        $(".graph_" + themeId + " svg").remove();

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    // setting data for balkendiagramm
    setDataset: function (value) {
        this.set("dataset", value);
    },

    /**
     * requests util if portal is running on mobile device
     * @returns {Boolean} isMobile
     */
    checkIsMobile: function () {
        return Radio.request("Util", "isViewMobile");
    }
});

export default BalkendiagrammTheme;
