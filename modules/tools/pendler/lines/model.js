define(function (require) {

    var PendlerCoreModel = require("modules/tools/pendler/core/model"),
        ol = require("openlayers"),
        Lines;

    Lines = PendlerCoreModel.extend({
        defaults: _.extend({}, PendlerCoreModel.prototype.defaults, {
            zoomLevel: 0,
            // Layer zur Darstellung der Linien / Strahlen
            lineLayer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: null,
                name: "lineLayer"
            }),
            // Layer zur Darstellung der Beschriftung an Punkten am Strahlenende
            labelLayer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: null,
                name: "labelLayer"
            })
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
                lineLayerFeature = new ol.Feature({
                    geometry: feature.getGeometry()
                });

                lineLayerFeature.setStyle(new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "#c00909",
                        width: "3"
                    })
                }));

                this.get("lineLayer").getSource().addFeature(lineLayerFeature);

                // Erzeuge die Beschriftung. Dafür wird ein (unsichtbarere) Punkt am Ende jeder Linie gesetzt.
                // Wo das Ende ist (erste oder zweite Koordinate) entschreidet sich dabei aus der (Pendel-)Richtung
                if (this.get("direction") === "wohnort") {
                    labelCoordinates = _.last(feature.getGeometry().getCoordinates());
                }
                else {
                    labelCoordinates = _.first(feature.getGeometry().getCoordinates());
                }

                labelLayerFeature = new ol.Feature({
                    geometry: new ol.geom.Point(labelCoordinates)
                });

                labelLayerFeature.setStyle(new ol.style.Style({
                    text: new ol.style.Text({
                        text: feature.get(this.get("attrAnzahl")),
                        font: "14pt sans-serif",
                        placement: "point",
                        stroke: new ol.style.Stroke({
                            color: "#ffffff",
                            width: 5
                        })
                    })
                }));

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
        }
    });

    return Lines;
});
