import Theme from "../../model";
import RoutableView from "../../../objects/routingButton/view";

const BalkendiagrammTheme = Theme.extend({
    initialize: function () {
        var channel = Radio.channel("defaultTheme");

        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithChildObjects();
                this.getDateWithYear();
                this.checkRoutable();
            }
        });

        // render gfi new when changing properties of the associated features
        this.listenTo(channel, {
            "changeGfi": function () {
                Radio.trigger("gfiView", "render");
            }
        });
    },

    /**
     * Prüft, ob der Button zum Routen angezeigt werden soll
     * @returns {void}
     */
    checkRoutable: function () {
        if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "routing"})) === false) {
            if (this.get("routable") === true) {
                this.set("routable", new RoutableView());
            }
        }
    },
    /**
     * Hier werden bei bestimmten Keywords Objekte anstatt von Texten für das template erzeugt. Damit können Bilder oder Videos als eigenständige Objekte erzeugt und komplex
     * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
     * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benötigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
     * Das Auswählen der richtigen Werte für die Übergabe erfolgt hier.
     * @returns {void}
     */
    replaceValuesWithChildObjects: function () {
        var element = this.get("gfiContent"),
            key,
            idx,
            value;

        for (key in element[0]) {
            idx = key.replace(" ", "_");
            if (!isNaN(key)) {
                idx = "year_" + key;
            }
            value = element[0][key];
            this.set(idx, value);
        }
    },

    /**
     * Here we get the data with the year for preparaing the balkendiagram
     * @returns {void}
     */
    getDateWithYear: function () {
        var element = this.get("gfiContent"),
            key,
            year,
            sum,
            dataset = [];

        for (key in element[0]) {
            if (!isNaN(key)) {
                year = key;
                sum = element[0][key];
                dataset.push({year, sum});
            }
        }
        console.log(dataset);
        this.setDataset(dataset);
    },

    /**
     * Generates the graph config and triggers the Graph-functionality to create the graph
     * @param {String} key Name of category
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createD3Document: function () {
        const graphConfig = {
            "graphType": "BarGraph",
            "selector": ".graph",
            "width": "375",
            "height": 225.6667,
            "margin": {
                "top": 20,
                "right": 20,
                "bottom": 50,
                "left": 50
            },
            "svgClass": "BarGraph-svg",
            "selectorTooltip": ".graph-tooltip-div",
            "data": [
                {
                    "hour": 0,
                    "sum": 182
                },
                {
                    "hour": 1,
                    "sum": 182
                },
                {
                    "hour": 2,
                    "sum": 182
                },
                {
                    "hour": 3,
                    "sum": 182
                },
                {
                    "hour": 4,
                    "sum": 182
                },
                {
                    "hour": 5,
                    "sum": 182
                },
                {
                    "hour": 6,
                    "sum": 182.732
                },
                {
                    "hour": 7,
                    "sum": 181.837
                },
                {
                    "hour": 8,
                    "sum": 176.332
                },
                {
                    "hour": 9,
                    "sum": 165.02
                },
                {
                    "hour": 10,
                    "sum": 165.024
                },
                {
                    "hour": 11,
                    "sum": 164.578
                },
                {
                    "hour": 12,
                    "sum": 167.545
                },
                {
                    "hour": 13,
                    "sum": 169.941
                },
                {
                    "hour": 14,
                    "sum": 170.874
                },
                {
                    "hour": 15,
                    "sum": 173.68
                },
                {
                    "hour": 16,
                    "sum": 176.093
                },
                {
                    "hour": 17,
                    "sum": 168.618
                },
                {
                    "hour": 18,
                    "sum": 167.623
                },
                {
                    "hour": 19,
                    "sum": 170.153
                },
                {
                    "hour": 20,
                    "sum": 171.614
                },
                {
                    "hour": 21,
                    "sum": 175.416
                },
                {
                    "hour": 22,
                    "sum": 179.934
                },
                {
                    "hour": 23,
                    "sum": 181
                }
            ],
            "scaleTypeX": "linear",
            "scaleTypeY": "linear",
            "yAxisTicks": {
                "start": 0,
                "end": 200,
                "ticks": 10,
                "factor": ",f"
            },
            "yAxisLabel": {},
            "xAxisTicks": {
                "start": 0,
                "end": 24,
                "ticks": 12,
                "unit": "Uhr"
            },
            "xAxisLabel": {
                "label": "Durchschnittliche Verfügbarkeit Montags",
                "offset": 10,
                "textAnchor": "middle",
                "fill": "#000",
                "fontSize": 12,
                "translate": 6
            },
            "xAttr": "hour",
            "attrToShowArray": [
                "sum"
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
