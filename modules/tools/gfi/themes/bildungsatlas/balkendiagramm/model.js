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
            layerName,
            layerDataFormat;

        // Get the attributes from config file
        layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "balkendiagramm", "id": this.get("themeId")});

        // Get the attributes from list individuelly to show in different layers
        layerName = layerList[0].get("name");
        layerDataFormat = layerList[0].get("format");

        if (layerName === "Stadtteile") {
            this.set("Title", element[0].Stadtteil);

            content[element[0].Stadtteil] = this.get("latestStatistic");
            content["Bezirk " + element[0].Bezirk] = element[0].BezirkGesamt;
            content.hamburg = element[0].HHGesamt;
        }
        else if (layerName === "Sozialräume") {
            this.set("Title", element[0]["SR Name"]);

            content[element[0]["SR Name"]] = this.get("latestStatistic");
            content["Bezirk " + element[0].Bezirk] = element[0].BezirkGesamt;
            content.hamburg = element[0].HHGesamt;
        }
        else if (layerName === "Statistische Gebiete") {
            this.set("Title", element[0].Stadtteil + ": " + element[0]["StatGeb Nr"]);

            content["Statistisches Gebiet"] = this.get("latestStatistic");
            content[element[0].Stadtteil] = element[0].StadtteilGesamt;
            content["Bezirk " + element[0].Bezirk] = element[0].BezirkGesamt;
            content.hamburg = element[0].HHGesamt;
        }

        if (layerDataFormat === "anteil") {
            for (key in content) {
                content[key] = Math.trunc(content[key]) + "%";
            }
        }

        // get the description of this diagram
        this.set("description", layerList[0].get("description"));

        this.set("content", content);

    },

    /**
     * Here we get the data with the year for preparaing the balkendiagram
     * @returns {void}
     */
    getStaticWithYear: function () {
        var element = this.get("gfiContent"),
            dataset;

        dataset = element.allProperties.Statistic;
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
        var width = parseInt($(".gfi-bakendiagramm").css("width"), 10);
        const graphConfig = {
            graphType: "BarGraph",
            selector: ".graph",
            width: width - 10,
            height: 170,
            margin: {
                top: 20,
                right: 20,
                bottom: 30,
                left: 45
            },
            svgClass: "graph-svg",
            selectorTooltip: ".graph-tooltip-div",
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
            ]
        };

        $(".graph svg").remove();
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
