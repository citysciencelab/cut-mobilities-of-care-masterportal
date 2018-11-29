import PendlerCoreModel from "../core/model";
import {Stroke, Style, Text} from "ol/style.js";
import {Point} from "ol/geom.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature.js";


const Lines = PendlerCoreModel.extend({
    defaults: _.extend({}, PendlerCoreModel.prototype.defaults, {
        zoomLevel: 0,
        // Layer zur Darstellung der Linien / Strahlen
        lineLayer: new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "lineLayer"
        }),
        // Layer zur Darstellung der Beschriftung an Punkten am Strahlenende
        labelLayer: new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "labelLayer"
        }),
        glyphicon: "glyphicon-play-circle"
    }),

    preparePendlerLegend: function (features) {
        var pendlerLegend = [];

        _.each(features, function (feature) {
            // Ein Feature entspricht einer Gemeinde. Extraktion der für die Legende
            // nötigen Attribute (abhängig von der gewünschten Richtung).
            pendlerLegend.push({
                anzahlPendler: feature.get(this.get("attrAnzahl")),
                name: feature.get(this.get("attrGemeinde"))
            });
        }, this);

        this.set("pendlerLegend", pendlerLegend);
    },

    handleData: function () {
        var rawFeatures = this.get("lineFeatures"),
            topFeatures,
            lineLayer,
            labelLayer;

        // Add layers for lines and labels if neccessary. If Layers
        // are already exiting clean them.
        labelLayer = Radio.request("Map", "createLayerIfNotExists", "labelLayer");
        this.set("labelLayer", labelLayer);
        this.get("labelLayer").getSource().clear();
        lineLayer = Radio.request("Map", "createLayerIfNotExists", "lineLayer");
        this.set("lineLayer", lineLayer);
        this.get("lineLayer").getSource().clear();

        // Lege die Reihenfolge der Layer fest, damit die Beschriftungen nicht von den Zahlen überdeckt werden.
        this.get("labelLayer").setZIndex(11);
        this.get("lineLayer").setZIndex(10);

        // Zentriere View auf die Gemeinde, zeichne aber keinen Marker ein.
        this.centerGemeinde(false);

        topFeatures = this.selectFeatures(rawFeatures);

        this.preparePendlerLegend(topFeatures);
        this.createFeatures(topFeatures);

        Radio.trigger("Map", "render");
    },

    /**
     * Erzeuge die Strahlen mit Beschriftung für jede Gemeinde.
     * @param {Object[]} features Feature-Liste
     * @returns {Void} Keine Rückgabe
     */
    createFeatures: function (features) {

        _.each(features, function (feature) {
            var lineLayerFeature,
                labelCoordinates,
                labelLayerFeature;

            // Erzeuge die Strahlen
            lineLayerFeature = new Feature({
                geometry: feature.getGeometry()
            });

            lineLayerFeature.setStyle(new Style({
                stroke: new Stroke({
                    color: [192, 9, 9, 1],
                    width: "3"
                })
            }));
            // "styleId" neccessary for print, that style and feature can be linked
            lineLayerFeature.set("styleId", _.uniqueId());
            this.get("lineLayer").getSource().addFeature(lineLayerFeature);

            // Erzeuge die Beschriftung. Dafür wird ein (unsichtbarere) Punkt am Ende jeder Linie gesetzt.
            // Wo das Ende ist (erste oder zweite Koordinate) entschreidet sich dabei aus der (Pendel-)Richtung
            if (this.get("direction") === "wohnort") {
                labelCoordinates = _.last(feature.getGeometry().getCoordinates());
            }
            else {
                labelCoordinates = _.first(feature.getGeometry().getCoordinates());
            }

            labelLayerFeature = new Feature({
                geometry: new Point(labelCoordinates)
            });

            labelLayerFeature.setStyle(new Style({
                text: new Text({
                    text: feature.get(this.get("attrAnzahl")),
                    font: "10pt sans-serif",
                    placement: "point",
                    stroke: new Stroke({
                        color: [255, 255, 255, 1],
                        width: 5
                    })
                })
            }));
            // "styleId" neccessary for print, that style and feature can be linked
            labelLayerFeature.set("styleId", _.uniqueId());
            this.get("labelLayer").getSource().addFeature(labelLayerFeature);

        }, this);
    },

    /**
     * Entefernt das Diagramm von der Karte
     * @returns {Void} Kein Rückgabewert
     */
    clear: function () {
        var lineLayer,
            labelLayer;

        lineLayer = this.get("lineLayer");
        if (!_.isUndefined(lineLayer)) {
            Radio.trigger("Map", "removeLayer", lineLayer);
        }

        labelLayer = this.get("labelLayer");
        if (!_.isUndefined(lineLayer)) {
            Radio.trigger("Map", "removeLayer", labelLayer);
        }
        Radio.trigger("MapMarker", "hideMarker");
    }
});

export default Lines;
