define(function (require) {

    var ol = require("openlayers"),
        Layer = require("modules/core/modelList/layer/model"),
        WMSLayer = require("modules/core/modelList/layer/wms"),
        WFSLayer = require("modules/core/modelList/layer/wfs"),
        GeoJSONLayer = require("modules/core/modelList/layer/geojson"),
        SensorLayer = require("modules/core/modelList/layer/sensor"),
        HeatmapLayer = require("modules/core/modelList/layer/heatmap"),
        GroupLayer;

    GroupLayer = Layer.extend({
        defaults: _.extend({}, Layer.prototype.defaults),

        initialize: function () {
            Layer.prototype.initialize.apply(this);
        },

        /**
         * Bei GruppenLayern sind die LayerSources deren childLayer.
         * Damit die layerSources nicht die layer.initialize() durchlaufen,
         * wurde isChildLayer: true im parser gesetzt.
         * @return {void}
         */
        createLayerSource: function () {
            var layerSource = [];

            _.each(this.get("children"), function (childLayerDefinition) {
                if (childLayerDefinition.typ === "WMS") {
                    layerSource.push(new WMSLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "WFS") {
                    if (childLayerDefinition.outputFormat === "GeoJSON") {
                        layerSource.push(new GeoJSONLayer(childLayerDefinition));
                    }
                    layerSource.push(new WFSLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "GeoJSON") {
                    layerSource.push(new GeoJSONLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "SensorThings" || childLayerDefinition.typ === "ESRIStreamLayer") {
                    layerSource.push(new SensorLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "Heatmap") {
                    layerSource.push(new HeatmapLayer(childLayerDefinition));
                }

                _.last(layerSource).prepareLayerObject();
            }, this);

            this.setLayerSource(layerSource);
        },

        /**
         * Erzeugt einen Gruppenlayer mit den layerSources
         * @return {void}
         */
        createLayer: function () {
            var layers = _.map(this.get("layerSource"), function (layer) {
                    return layer.get("layer");
                }),
                groupLayer = new ol.layer.Group({
                    layers: layers,
                    visible: false
                });

            this.setLayer(groupLayer);
        },

        /**
         * Erzeugt die legendenURLs der child-Layer
         * @return {void}
         */
        createLegendURL: function () {
            _.each(this.get("layerSource"), function (layerSource) {
                layerSource.createLegendURL();
            }, this);
        },

        /**
         * Startet updateSource() an allen layerSources, an denen es vorhanden ist.
         * Nicht alle Layertypen unterstützen updateSource().
         * @returns {void}
         */
        updateSource: function () {
            _.each(this.get("layerSource"), function (layerSource) {
                if (typeof layerSource.updateSource !== "undefined") {
                    layerSource.updateSource();
                }
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

            _.each(this.get("children"), function (layer) {
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
        * Prüft anhand der Scale aller layerSources, ob der Layer sichtbar ist oder nicht
        * @param {object} options   Object mit zu prüfender .scale
        * @returns {void}
        **/
        checkForScale: function (options) {
            var isOutOfRange = false;

            _.each(this.get("layerSource"), function (layerSource) {
                if (parseFloat(options.scale, 10) >= layerSource.get("maxScale") || parseFloat(options.scale, 10) <= layerSource.get("minScale")) {
                    isOutOfRange = true;
                }
            });
            this.setIsOutOfRange(isOutOfRange);
        }

    });

    return GroupLayer;
});
