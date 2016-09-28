define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        ol = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        initialize: function () {

            var channel = Radio.channel("RemoteInterface");

            channel.on({
                "addFeature": this.addFeature,
                "addFeatures": this.addFeatures,
                "centerFeature": this.centerFeature,
                "zoomToFeatures": this.zoomToFeatures,
                "resetView": this.resetView
            }, this);
            Radio.trigger("Map", "addLayerToIndex", [this.createLayer(), 0]);
            parent.Backbone.MasterRadio = Radio;
            parent.postMessage("ready", "*");
            //Radio.trigger("remoteInterface", "addFeature", {});

         /*  window.onmessage = function(e){
                    context.addFeature(e.data);
                    parent.postMessage('featureAdded', '*');
            };*/
        },
        addFeature: function (hit) {
            var feature = this.getFeatureFromHit(hit);
            Radio.trigger("Map", "addFeatureToLayer", feature, "gewerbeflaechen");


        },
        addFeatures: function (features) {
            _.each(features, function (features) {
                this.addFeature(features._source);
            }, this);
        },
        createLayer: function () {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({useSpatialIndex: false}),
                alwaysOnTop: true,
                name: "gewerbeflaechen"
            });

            return layer;
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
        getFeatureFromHit(hit) {
            var reader = new ol.format.GeoJSON(),
                geom = reader.readGeometry(hit.geometry_gewfl, {
                    dataProjection: "EPSG:25832"
                }),
                feature = new ol.Feature({
                    geometry: geom
                });
                return feature;
        }
    });

    return RemoteInterface;
});
