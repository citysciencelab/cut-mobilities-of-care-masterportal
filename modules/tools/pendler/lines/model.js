import PendlerCoreModel from "../core/model";
import {Stroke, Style, Text} from "ol/style.js";
import {Point} from "ol/geom.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature.js";


const Lines = PendlerCoreModel.extend(/** @lends Lines.prototype */{
    defaults: _.extend({}, PendlerCoreModel.prototype.defaults, {
        zoomLevel: 0,
        // Layer zur Darstellung der Linien / Strahlen
        lineLayer: new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLineLayer"
        }),
        // Layer zur Darstellung der Beschriftung an Punkten am Strahlenende
        labelLayer: new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLabelLayer"
        }),
        glyphicon: "glyphicon-play-circle"
    }),
    /**
     * @class Lines
     * @extends PendlerCoreModel
     * @memberof pendler
     * @constructs
     * @property {Number} zoomLevel=0 level map is not zoomed
     * @property {Object} lineLayer=new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLineLayer"
        }) Layer zur Darstellung der Linien / Strahlen
     * @property {Object} labelLayer=new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLabelLayer"
        }) Layer zur Darstellung der Beschriftung an Punkten am Strahlenende
     * @property {String} glyphicon="glyphicon-play-circle" icon to start the animation
     * @fires Core#RadioTriggerMapRender
     * @listens Alerting#RadioTriggerAlertConfirmed
     */

    /**
     * Iterates over the given features and prepares the data for the legend.
     * @param {Object[]} features array of 'gemeinde' features
     * @returns {void}
     */
    preparePendlerLegend: function (features) {
        const pendlerLegend = [];

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
    /**
     * creates the layers and their order and centers the 'gemeinde'
     * @returns {void}
     */
    handleData: function () {
        const rawFeatures = this.get("lineFeatures");
        let topFeatures = null,
            lineLayer = null,
            labelLayer = null;

        // Handling for "no data": Just refresh legend (clear and print message).
        if (rawFeatures.length === 0) {

            // Since legend is already rendered while data is fetched it's necessary to introduce a flag for empty result.
            // Otherwise the message for "empty result" is printed always before the data has been fetched.
            this.set("emptyResult", true);
            return;
        }

        // Add layers for lines and labels if neccessary. If Layers
        // are already exiting clean them.
        labelLayer = Radio.request("Map", "createLayerIfNotExists", "pendlerLabelLayer");
        this.set("pendlerLabelLayer", labelLayer);
        this.get("pendlerLabelLayer").getSource().clear();
        lineLayer = Radio.request("Map", "createLayerIfNotExists", "pendlerLineLayer");
        this.set("pendlerLineLayer", lineLayer);
        this.get("pendlerLineLayer").getSource().clear();

        // Lege die Reihenfolge der Layer fest, damit die Beschriftungen nicht von den Zahlen überdeckt werden.
        this.assertLayerOnTop("pendlerLineLayer");
        this.assertLayerOnTop("pendlerLabelLayer");

        // Zentriere View auf die Gemeinde, zeichne aber keinen Marker ein.
        this.centerGemeinde(false);

        topFeatures = this.selectFeatures(rawFeatures);

        this.preparePendlerLegend(topFeatures);
        this.createFeatures(topFeatures);
        // setzte den layer nochmals ganz oben drauf, da der z-index zwischenzeitlich angepaßt wurde
        this.assertLayerOnTop("pendlerLabelLayer");

        Radio.trigger("Map", "render");
    },

    /**
     * Erzeuge die Strahlen mit Beschriftung für jede Gemeinde.
     * @param {Object[]} features Feature-Liste
     * @returns {void} Keine Rückgabe
     */
    createFeatures: function (features) {
        let lineLayerFeature,
            labelCoordinates,
            labelLayerFeature;

        _.each(features, function (feature) {
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
            this.get("pendlerLineLayer").getSource().addFeature(lineLayerFeature);

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
            this.get("pendlerLabelLayer").getSource().addFeature(labelLayerFeature);

        }, this);
    },

    /**
     * Entfernt das Diagramm von der Karte
     * @returns {void}
     */
    clear: function () {
        let lineLayer = null,
            labelLayer = null;

        lineLayer = this.get("pendlerLineLayer");
        if (!_.isUndefined(lineLayer)) {
            Radio.trigger("Map", "removeLayer", lineLayer);
        }

        labelLayer = this.get("pendlerLabelLayer");
        if (!_.isUndefined(lineLayer)) {
            Radio.trigger("Map", "removeLayer", labelLayer);
        }
        Radio.trigger("MapMarker", "hideMarker");
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        if (this.model.get("isActive") === true) {
            this.model.set({
                "currentLng": lng
            });
        }
    }
});

export default Lines;
