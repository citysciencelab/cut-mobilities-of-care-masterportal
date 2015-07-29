define([
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/layer/Layer",
    "modules/layer/wmslayer",
    "modules/layer/wfslayer"
], function (Backbone, ol, EventBus, Config, Layer, WMSLayer, WFSLayer) {

    /**
     *
     */
    var GroupLayer = Layer.extend({
        /**
         *
         */
        setAttributionLayerSource: function () {
            // Erzeuge Layers-Objekt
            var layerdefinitions = this.get("layerdefinitions"),
                layers = new ol.Collection(),
                newlayer,
                backbonelayers = [];

            _.each(layerdefinitions, function (layerdefinition) {
                if (layerdefinition.typ === "WMS") {
                    newlayer = new WMSLayer(layerdefinition);
                }
                else if (layerdefinition.typ === "WFS") {
                    newlayer = new WFSLayer(layerdefinition);
                }
                // Setze Dafault-Werte für Layer, damit Einstellung des Gruppenlayers sich nicht mit Einstellung des Layers überschneidet
                newlayer.get("layer").setVisible(true);
                newlayer.visibility = true;
                newlayer.get("layer").setOpacity(1);
                newlayer.get("layer").setSaturation(1);
                layers.push(newlayer.get("layer"));
                backbonelayers.push(newlayer);
            });
            this.set("layers", layers);
            this.set("backbonelayers", backbonelayers);
        },
        setVisibility: function () {
            var visibility = this.get("visibility");

            this.get("layer").setVisible(visibility);
            // NOTE bei Gruppenlayern auch childLayer umschalten. Wichtig für Attribution
            _.each(this.get("backbonelayers"), function (bblayer) {
                bblayer.set("visibility", visibility);
            });
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set("layer", new ol.layer.Group({
                typ: this.get("typ"),
                layers: this.get("layers"),
                name: this.get("name")
            }));
            this.unset("layerdefinitions");
            this.unset("layers");
        },
        reload: function () {
            this.get("layer").getLayers().forEach(function () {
                reloadLayer(this);
            });
        }
    });

    return GroupLayer;
});
