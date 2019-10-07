import Theme from "../../model";

const BalkendiagrammTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                this.setContent();
                this.getStaticWithYear();
                this.getLatestStatistic();
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
            value,
            layerList,
            layerName;

        for (key in element[0]) {
            value = element[0][key];
            this.set(key, value);
        }

        // Get the attributes from config file
        layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "balkendiagramm", "id": this.get("themeId")});

        // Get the attributes from list individuelly to show in different layers
        layerName = layerList[0].get("name");
        if (layerName === "Stadtteile") {
            this.set("Title", element[0].Stadtteil);
            this.set("Name", element[0].Stadtteil);
        }
        else if (layerName === "Sozialräume") {
            this.set("Title", element[0]["SR Name"]);
            this.set("Name", element[0]["SR Name"]);
        }
        else if (layerName === "Statistische Gebiete") {
            this.set("Title", element[0].Stadtteil + ": " + element[0]["StatGeb Nr"]);
            this.set("Name", "Statistisches Gebiet");
        }

        // get the description of this diagram
        this.set("description", layerList[0].get("description"));

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

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    // setting data for balkendiagramm
    setDataset: function (value) {
        this.set("dataset", value);
    }
});

export default BalkendiagrammTheme;
