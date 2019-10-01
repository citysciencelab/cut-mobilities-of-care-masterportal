import Theme from "../../model";

const BalkendiagrammTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceKey();
                this.getStaticWithYear();
            }
        });
    },

    /**
     * we need to make the key meaningful to be extracted in template
     * @returns {void}
     */
    replaceKey: function () {
        var element = this.get("gfiContent"),
            key,
            value;

        for (key in element[0]) {
            value = element[0][key];
            this.set(key, value);
        }
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
                left: 40
            },
            svgClass: "graph-svg",
            selectorTooltip: ".graph-tooltip-div",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            yAxisTicks: {
                ticks: 10,
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
