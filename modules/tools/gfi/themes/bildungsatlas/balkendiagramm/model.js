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
    createD3Document: function (key) {
        var graphConfig = {
            graphType: "Linegraph",
            selector: ".graph",
            width: 387,
            height: 196,
            margin: {top: 20, right: 20, bottom: 75, left: 70},
            svgClass: "graph-svg",
            selectorTooltip: ".graph-tooltip-div",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            yAxisTicks: {
                ticks: 7,
                factor: ",f"
            },
            data: [
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2008,
                    "DTV": 25000,
                    "DTVw": 28000,
                    "Schwerverkehrsanteil am DTVw": 8
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2009,
                    "DTV": 25000,
                    "DTVw": 28000,
                    "Schwerverkehrsanteil am DTVw": 7
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2010,
                    "DTV": 24000,
                    "DTVw": 27000,
                    "Schwerverkehrsanteil am DTVw": 7
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2011,
                    "DTV": 24000,
                    "DTVw": 27000,
                    "Schwerverkehrsanteil am DTVw": 7
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2012,
                    "DTV": 24000,
                    "DTVw": 27000,
                    "Schwerverkehrsanteil am DTVw": 6
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2013,
                    "DTV": 26000,
                    "DTVw": 29000,
                    "Schwerverkehrsanteil am DTVw": 7
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2014,
                    "DTV": 29000,
                    "DTVw": 32000,
                    "Schwerverkehrsanteil am DTVw": 8
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2015,
                    "DTV": 30000,
                    "DTVw": 33000,
                    "Schwerverkehrsanteil am DTVw": 7
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2016,
                    "DTV": 30000,
                    "DTVw": 33000,
                    "Schwerverkehrsanteil am DTVw": 7
                },
                {
                    "class": "dot",
                    "style": "circle",
                    "year": 2017,
                    "DTV": 31000,
                    "DTVw": 34000,
                    "Schwerverkehrsanteil am DTVw": 7
                }
            ],
            xAttr: "year",
            xAxisLabel: {
                label: "Jahr",
                translate: 6
            },
            yAxisLabel: {
                offset: 60
            },
            attrToShowArray: [key]
        };

        const testConfig = {
            "graphType": "BarGraph",
            "selector": ".graph",
            "width": "420",
            "height": 209,
            "margin": {
                "top": 20,
                "right": 20,
                "bottom": 50,
                "left": 50
            },
            "svgClass": "graph-tooltip-div",
            "data": [
                {
                    "year": 2008,
                    "sum": 169
                },
                {
                    "year": 2009,
                    "sum": 169
                },
                {
                    "year": 2010,
                    "sum": 169
                },
                {
                    "year": 2011,
                    "sum": 159
                },
                {
                    "year": 2012,
                    "sum": 158
                },
                {
                    "year": 2013,
                    "sum": 162
                },
                {
                    "year": 2014,
                    "sum": 167
                },
                {
                    "year": 2015,
                    "sum": 190
                },
                {
                    "year": 2016,
                    "sum": 262
                },
                {
                    "year": 2017,
                    "sum": 277
                }
            ],
            "scaleTypeX": "linear",
            "scaleTypeY": "linear",
            "yAxisTicks": {
                "start": 0,
                "end": 20000,
                "ticks": 4,
                "factor": ",f"
            },
            "xAxisTicks": {
                "start": 2008,
                "end": 2017,
                "ticks": 10,
                "unit": "Year"
            },
            "xAxisLabel": {
                "label": "Durchschnittliche Verfügbarkeit Montags",
                "offset": 10,
                "textAnchor": "middle",
                "fill": "#666",
                "fontSize": 12
            },
            "yAxisLabel": {},
            "xAttr": "Year",
            "attrToShowArray": [
                "sum"
            ]
        };

        Radio.trigger("Graph", "createGraph", testConfig);
    },

    // setting data for balkendiagramm
    setDataset: function (value) {
        this.set("dataset", value);
    }
});

export default BalkendiagrammTheme;
