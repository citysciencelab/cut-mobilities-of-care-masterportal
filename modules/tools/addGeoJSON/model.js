define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Util = require("modules/core/util"),
        AddGeoJSON;

    AddGeoJSON = Backbone.Model.extend({
        defaults: {
            reader: new ol.format.GeoJSON()
        },

        initialize: function () {
            var channel = Radio.channel("AddGeoJSON");

            this.listenTo(channel, {
                "addFeaturesFromGBM": function (hits, layerName) {
                    this.setLayerName(layerName);
                    this.createFeaturesFromGBM(hits);
                }
            });

            this.listenToOnce(channel, {
                "addFeaturesFromGBM": this.addFolder
            });

            this.listenTo(this, {
                "change:features": this.addLayer
            });
        },

        addFolder: function () {
            Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "Themen", 0);
        },

        addLayer: function () {
            Radio.trigger("Parser", "addGeoJSONLayer", this.getLayerName(), _.uniqueId(), "ExternalLayer", 1, this.getFeatures());
        },

        createFeaturesFromGBM: function (hits) {
            var features = [];

            _.each(hits, function (hit) {
                var feature = new ol.Feature({
                    geometry: this.readAndGetGeometry(hit.geometry_UTM_EPSG_25832),
                    id: hit.id
                });

                feature.setProperties(_.omit(hit, "geometry_UTM_EPSG_25832"));
                features.push(feature);
            }, this);

            this.setFeatures(features);
        },

        readAndGetGeometry: function (geometry) {
            return this.getReader().readGeometry(geometry, {
                dataProjection: "EPSG:25832"
            });
        },

        // Setter
        setFeatures: function (value) {
            this.set("features", value);
        },

        setLayerName: function (value) {
            this.set("layerName", value);
        },

        // Getter
        getReader: function () {
            return this.get("reader");
        },

        getFeatures: function () {
            return this.get("features");
        },

        getLayerName: function () {
            return this.get("layerName");
        }
    });

    return AddGeoJSON;

});
