define(function (require) {

    var Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Layer = require("modules/core/modelList/layer/model"),
        WMSLayer = require("modules/core/modelList/layer/wms"),
        WFSLayer = require("modules/core/modelList/layer/wfs"),
        GeoJSONLayer = require("modules/core/modelList/layer/geojson"),
        SensorLayer = require("modules/core/modelList/layer/sensor"),
        HeatmapLayer = require("modules/core/modelList/layer/heatmap"),
        GroupLayer;

    GroupLayer = Layer.extend({
        defaults: _.extend({}, Layer.prototype.defaults, {
            childLayer: []
        }),

        initialize: function () {
            Layer.prototype.initialize.apply(this);
        },

        /**
         * Bei GruppenLayern sind die LayerSource die childLayers.
         * Damit die childLayer nicht die layer.initialize() durchlaufen,
         * wird isChildLayer: true gesetzt.
         * 
         * @return {void}
         */
        createLayerSource: function () {
            _.each(this.get("layerdefinitions"), function(childLayerDefinition) {
                // ergänze isChildLayer für initialize
                _.extend(childLayerDefinition, {
                    isChildLayer: true
                });

                if (childLayerDefinition.typ === "WMS") {
                    this.get("childLayer").push(new WMSLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "WFS") {
                    if (childLayerDefinition.outputFormat === "GeoJSON") {
                        this.get("childLayer").push(new GeoJSONLayer(childLayerDefinition));
                    }
                    this.get("childLayer").push(new WFSLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "GeoJSON") {
                    this.get("childLayer").push(new GeoJSONLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "SensorThings" || childLayerDefinition.typ === "ESRIStreamLayer") {
                    this.get("childLayer").push(new SensorLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "Heatmap") {
                    this.get("childLayer").push(new HeatmapLayer(childLayerDefinition));
                }

                _.last(this.get("childLayer")).prepareLayerObject();
            }, this);
        },

        /**
         * Erzeugt einen Gruppenlayer mit den childLayern
         * 
         * @return {void}
         */
        createLayer: function () {
            var layers = _.map(this.get("childLayer"), function (layer) {
                    return layer.get("layer");
                }),
                groupLayer = new ol.layer.Group({
                    layers: layers
                });

            this.setLayer(groupLayer);
        },

        /**
         * Erzeugt die legendenURLs der child-Layer
         * @return {void}
         */
        createLegendURL: function () {
            _.each(this.get("childLayer"), function (childLayer) {
                childLayer.createLegendURL();
            }, this);
        },

        /**
         * Diese Funktion initiiert für den abgefragten Layer die Darstellung der Information und Legende.
         * @returns {void}
         */
        showLayerInformation: function () {
            var metaID = [],
                legend = Radio.request("Legend", "getLegend", this),
                name = this.get("name");

            _.each(this.get("layerdefinitions"), function (layer) {
                var layerMetaId = layer.datasets && layer.datasets[0] ? layer.datasets[0].md_id : null;

                if (layerMetaId) {
                    metaID.push(layerMetaId);
                }
            });

            Radio.trigger("LayerInformation", "add", {
                "id": this.get("id"),
                "legend": legend,
                "metaID": metaID,
                "layername": name,
                "url": null,
                "typ": null
            });

            this.setLayerInfoChecked(true);
        },

        /**
        * Prüft anhand der Scale aller childLayer, ob der Layer sichtbar ist oder nicht
        * @param {object} options
        * @returns {void}
        **/
        checkForScale: function (options) {
            var isOutOfRange = false;

            _.each(this.get("childLayer"), function (childLayer) {
                if (parseFloat(options.scale, 10) >= childLayer.get("maxScale") || parseFloat(options.scale, 10) <= childLayer.get("minScale")) {
                    isOutOfRange = true                    
                }
            });
            this.setIsOutOfRange(isOutOfRange);
        }

    });

    return GroupLayer;
});
