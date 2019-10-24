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
        var element = this.get("gfiContent"),
            key,
            content = {},
            layerList,
            layerDataFormat;

        // Get the attributes from config file
        layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "balkendiagramm", "id": this.get("themeId")});

        // Get the attributes from list individuelly to show in different layers
        layerDataFormat = layerList[0].get("format");

        // get the description of this diagram
        this.set("description", layerList[0].get("description"));

        if (layerDataFormat.description === "Stadtteile") {
            this.set("Title", element[0].Stadtteil);

            content[element[0].Stadtteil] = this.get("latestStatistic");
            content["Bezirk " + element[0].Bezirk] = element[0]["Summe bezirk"];
            content.Hamburg = element[0]["Summe hamburg"];

            // Check if the layer of wanderungen by the attribute description
            if (layerDataFormat.type === "anteilWanderungen") {
                content = {};
                content["In " + element[0].Stadtteil] = this.get("latestStatistic");
                content["Anteil der Zuzüge aus dem Umland:"] = element[0]["Zuzuege aus_umland"];
                content["Anteil der Zuzüge ins Umland:"] = element[0]["Fortzuege aus_dem_umland"];
            }
        }
        else if (layerDataFormat.description === "Sozialräume") {
            this.set("Title", element[0]["Sozialraum name"]);

            content[element[0]["Sozialraum name"]] = this.get("latestStatistic");
            content["Bezirk " + element[0].Bezirk] = element[0]["Summe bezirk"];
            content.Hamburg = element[0]["Summe hamburg"];
        }
        else if (layerDataFormat.description === "Statistische Gebiete") {
            this.set("Title", element[0].Stadtteil + ": " + element[0].Statgebiet);

            content["Statistisches Gebiet"] = this.get("latestStatistic");
            content[element[0].Stadtteil] = element[0]["Summe stadtteil"];
            content["Bezirk " + element[0].Bezirk] = element[0]["Summe bezirk"];
            content.Hamburg = element[0]["Summe hamburg"];

            if (layerDataFormat.type === "anteilWanderungen") {
                content = {};
                content["im Statistischen Gebiet"] = this.get("latestStatistic");
            }
        }

        /**
         * Revert the null or empty value to standard value
         * check if the percentage should be added
         */
        for (key in content) {
            if (content[key] === null || _.isUndefined(content[key]) === true) {
                content[key] = "*g.F.";
            }
            else if (layerDataFormat.type === "anteil") {
                content[key] = Math.round(content[key]) + "%";
            }
            else if (layerDataFormat.type === "anteilWanderungen") {
                if (key.includes("im Statistischen Gebiet") || key.includes("In " + element[0].Stadtteil)) {
                    content[key] = this.get("latestStatistic") > 0 ? "+" + Math.round(this.get("latestStatistic") * 100) / 100 : Math.round(this.get("latestStatistic") * 100) / 100;
                }
                else {
                    content[key] = Math.round(content[key] * 100) / 100 + "%";
                }
            }
        }

        this.set("themeId", this.get("themeId"));
        this.set("layerDataFormat", layerDataFormat);
        this.set("layerDataFormatType", layerDataFormat.type);
        this.set("content", content);
    },

    /**
     * Here we get the data with the year for preparaing the balkendiagram
     * @returns {void}
     */
    getStaticWithYear: function () {
        var element = this.get("gfiContent"),
            key,
            dataset = [],
            layerList,
            layerDataFormat,
            year;

        // Get the attributes from config file
        layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "balkendiagramm", "id": this.get("themeId")});

        // Get the attributes from list individuelly to show in different layers
        layerDataFormat = layerList[0].get("format");

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
     * Here we get the data with the latest year
     * @returns {void}
     */
    getLatestStatistic: function () {
        var dataset = this.get("dataset");

        this.set("latestStatistic", dataset[dataset.length - 1].number);
    },

    /**
     * Generates the graph config and triggers the Graph-functionality to create the graph
     * @param {String} key Name of category
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createD3Document: function () {
        var width = parseInt($(".gfi-balkendiagramm").css("width"), 10),
            dataType = this.get("layerDataFormatType"),
            themeId = this.get("themeId");

        const graphConfig = {
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
