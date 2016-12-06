define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        AddGeoJSON;

    AddGeoJSON = Backbone.Model.extend({
        defaults: {
            reader: new ol.format.GeoJSON()
        },

        initialize: function () {
            var channel = Radio.channel("AddGeoJSON");

            this.listenTo(channel, {
                "addFeaturesFromGBM": function (hits, id, layerName) {
                    this.setLayerId(id);
                    this.setLayerName(layerName);
                    this.createFeaturesFromGBM(hits);
                }
            });

            this.listenTo(this, {
                "change:features": this.addLayer
            });
        },

        addLayer: function () {
            Radio.trigger("Parser", "addGeoJSONLayer", this.getLayerName(), this.getLayerId(), this.getFeatures());
            Radio.trigger("ModelList", "addModelsByAttributes", {id: this.getLayerId()});
        },

        /**
         * Erzeugt aus den Attributen im "IT-GBM" Index OpenLayers Features
         * @param  {Object[]} hits - Trefferliste mit Attributen
         */
        createFeaturesFromGBM: function (hits) {
            var features = [];

            _.each(hits, function (hit) {
                var feature = new ol.Feature({
                    geometry: this.readAndGetGeometry(hit.geometry_UTM_EPSG_25832)
                });

                feature.setProperties(_.omit(hit, "geometry_UTM_EPSG_25832"));
                feature.setId(hit.id);
                features.push(feature);
            }, this);

            this.setFeatures(features);
        },

        /**
         * Liest die Geometrie aus einem GeoJSON und gibt sie zurück
         * @param  {GeoJSON} geometry
         * @return {ol.geom.Geometry}
         */
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

        setLayerId: function (value) {
            this.set("layerId", value);
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
        },

        getLayerId: function () {
            return this.get("layerId");
        }
    });

    return AddGeoJSON;

});
