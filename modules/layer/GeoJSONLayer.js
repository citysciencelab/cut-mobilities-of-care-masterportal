define([
    "backbone",
    "openlayers",
    "config",
    "modules/layer/Layer",
    "modules/core/util"
], function (Backbone, ol, Config, Layer, Util) {

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
            this.set("cluster", new ol.source.Cluster({
                distance: 45,
                source: this.get("source")
            }));
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
                    source: this.get("cluster"),
                    name: this.get("name"),
                    typ: this.get("typ"),
                    style: function (feature) {
                        var size = feature.get("features").length,
                            style = {}[size];

                        if (size === 1) {
                            style = [new ol.style.Style({
                                image: new ol.style.Icon({
                                    anchor: [0.5, 1.0],
                                    src: Util.getPath("../img/hdb.png")
                                })
                             })];
                        }
                        else if (size > 1 && size < 25) {
                            style = [new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 18,
                                    fill: new ol.style.Fill({
                                        color: [255,0,25,1]
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [255,0,25,0.5],
                                        width: 10
                                    })
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    font: "18px Arial, sans-serif",
                                    fill: new ol.style.Fill({
                                        color: "#fff"
                                    })
                                })
                            })];
                        }
                        else {
                            style = [new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 20,
                                    fill: new ol.style.Fill({
                                        color: [253,156,115,0.9]
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [253,156,115,0.5],
                                        width: 12
                                    })
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    font: "12px Arial, sans-serif",
                                    fill: new ol.style.Fill({
                                        color: "#fff"
                                    })
                                })
                            })];
                        }
                        return style;
                  }
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
