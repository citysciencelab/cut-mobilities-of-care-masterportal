define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        ol = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("RemoteInterface");

            channel.reply({
                "getMapState": this.getMapState
            }, this);

            channel.on({
                "addFeature": this.addFeature,
                "addFeatures": this.addFeatures,
                "removeAllFeaturesFromLayer": this.removeAllFeaturesFromLayer,
                "centerFeature": this.centerFeature,
                "zoomToFeatures": this.zoomToFeatures,
                "resetView": this.resetView
            }, this);

            Radio.trigger("Map", "createVectorLayer", "gewerbeflaechen");
            parent.Backbone.MasterRadio = Radio;
            parent.postMessage("ready", "*");
        },
        addFeature: function (hit) {
            var feature = this.getFeatureFromHit(hit);

            Radio.trigger("Map", "addFeatureToLayer", feature, "gewerbeflaechen");
        },
        addFeatures: function (hits) {
            var result = [];
            _.each(hits, function (hit) {
                result.push(this.getFeatureFromHit(hit));
            }, this);
            Radio.trigger("Map", "addFeaturesToLayer", result, "gewerbeflaechen");
        },
        removeAllFeaturesFromLayer: function () {
            Radio.trigger("Map", "removeAllFeaturesFromLayer", "gewerbeflaechen");
        },

        centerFeature: function (hit) {
            var feature = this.getFeatureFromHit(hit),
                extent = feature.getGeometry().getExtent(),
                center = ol.extent.getCenter(extent);
                Radio.trigger("MapView", "setCenter", center);
                Radio.trigger("MapMarker", "showMarker", center);
        },
        zoomToFeature: function (hit) {
             var feature = this.getFeatureFromHit(hit),
                extent = feature.getGeometry().getExtent();

            Radio.trigger("Map", "zoomToExtent", extent);

        },
        zoomToFeatures: function (hits) {
            _.each(hits, function (hit, index) {
                hits[index] = this.getFeatureFromHit(hit);
            }, this);
            var extent = hits[0].getGeometry().getExtent().slice(0);

            hits.forEach(function (feature) {
                ol.extent.extend(extent, feature.getGeometry().getExtent());
            });
            Radio.trigger("Map", "zoomToExtent", extent);

        },
        resetView: function () {
            Radio.trigger("MapView", "resetView");
            Radio.trigger("MapMarker", "hideMarker");
        },
        getFeatureFromHit: function (hit) {
            var reader = new ol.format.GeoJSON(),
                geom = reader.readGeometry(hit._source.geometry_UTM_EPSG_25832, {
                    dataProjection: "EPSG:25832"
                }),
                feature = new ol.Feature({
                    geometry: geom,
                    type: hit._type
                });

                feature.setId(hit.id);
                return feature;
        },
        getMapState: function () {
            return Radio.request("SaveSelection", "getMapState");
        }
    });

    return RemoteInterface;
});
