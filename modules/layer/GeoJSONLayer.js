define([
    "backbone",
    "openlayers",
    "config",
    "modules/layer/Layer"
], function (Backbone, ol, Config, Layer) {

    var GeoJSONLayer = Layer.extend({

        /**
         *
         */
        setAttributionLayerSource: function () {
            var geofeatures;

            this.set("GeoJSONFormat", new ol.format.GeoJSON());
            this.set("source", new ol.source.Vector());
            geofeatures = this.get("GeoJSONFormat").readFeatures(this.get("features"));
            this.get("source").addFeatures(geofeatures);
            _.each(geofeatures, function (feature) {
                feature.set("gfiAttributes", _.omit(feature.getProperties(), function (value) {
                    return _.isObject(value);
                }));
            });
        },

        /**
         *
         */
        setAttributionLayer: function () {
            var layerobjects = {
                    source: this.get("source"),
                    name: this.get("name"),
                    typ: this.get("typ")
            };

            this.set("layer", new ol.layer.Vector(layerobjects));
            this.toggleVisibility();
        },

        /**
         *
         */
        addFeatures: function (features) {
            var geofeatures;

            geofeatures = this.get("GeoJSONFormat").readFeatures(features);
            this.get("source").addFeatures(geofeatures);
            _.each(geofeatures, function (feature) {
                feature.set("gfiAttributes", _.omit(feature.getProperties(), function (value) {
                    return _.isObject(value);
                }));
            });
        },

        /**
         *
         */
        removeFeatures: function () {
            this.get("source").clear();
        }
    });

    return GeoJSONLayer;
});
