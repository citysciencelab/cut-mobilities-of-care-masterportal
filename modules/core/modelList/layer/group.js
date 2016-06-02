define([
    "backbone",
    "openlayers",
    "modules/core/modelList/layer/model",
    "modules/core/modelList/layer/wms",
    "modules/core/modelList/layer/wfs"
], function (Backbone, ol, Layer, WMSLayer, WFSLayer) {

    /**
     *
     */
    var GroupLayer = Layer.extend({
        /**
         *
         */
        createLayerSource: function () {
            // Erzeuge Layers-Objekt
            var layerdefinitions = this.get("layerdefinitions"),
                childlayers = new ol.Collection(),
                newlayer,
                backbonelayers = [];

            _.each(layerdefinitions, function (layerdefinition) {
                if (layerdefinition.typ === "WMS") {
                    newlayer = new WMSLayer(layerdefinition);
                }
                else if (layerdefinition.typ === "WFS") {
                    newlayer = new WFSLayer(layerdefinition);
                }
                newlayer.createLayerSource();
                childlayers.push(newlayer.getLayer());
                backbonelayers.push(newlayer);
            }, this);
            this.unset("layerdefinitions");
            this.setChildLayers(childlayers);
            this.createLayer();
            this.set("backbonelayers", backbonelayers);
        },

        /**
         *
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Group({
                layers: this.getChildLayers()
            }));
        },

        setLegendURL: function () {
            var legendURL = [];

            _.each(this.get("backbonelayers"), function (layer) {
                legendURL.push(layer.get("legendURL")[0]);
            });
            this.set("legendURL", legendURL);
        },

        /**
         * Setter für das Attribut "childlayers"
         * @param {ol.Collection} - Eine ol.Collection mit ol.layer Objekten
         */
        setChildLayers: function (value) {
            this.set("childlayers", value);
        },

        /**
         * Getter für das Attribut "childlayers"
         * @return {ol.Collection} - Eine ol.Collection mit ol.layer Objekten
         */
        getChildLayers: function () {
            return this.get("childlayers");
        }
    });

    return GroupLayer;
});
