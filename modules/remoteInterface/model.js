define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        OL = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            parent.Backbone.MBARadio = Radio;
            var channel = Radio.channel("RemoteInterface");

            channel.on({
                "addFeature": this.addFeature,
                "centerFeature": this.centerFeature,
                "zoomToFeature": this.zoomToFeature,
                "resetView": this.resetView
            }, this);
            Radio.trigger("Map", "addLayerToIndex", [this.createLayer(), 0]);
            //Radio.trigger("remoteInterface", "addFeature", {});

         /*  window.onmessage = function(e){
                    context.addFeature(e.data);
                    parent.postMessage('featureAdded', '*');
            };*/
        },
        addFeature: function (coords) {
            var feature = new OL.Feature(new OL.geom.Polygon([coords]));
            Radio.trigger("Map", "addFeatureToLayer", feature, "gewerbeflaechen");


        },
        createLayer: function () {
            var layer = new OL.layer.Vector({
                source: new OL.source.Vector({useSpatialIndex: false}),
                alwaysOnTop: true,
                name: "gewerbeflaechen"
            });

            return layer;
        },
        centerFeature: function (coords) {
            var feature = new OL.Feature(new OL.geom.Polygon([coords])),
                extent = feature.getGeometry().getExtent(),
                center = OL.extent.getCenter(extent);
                Radio.trigger("MapView", "setCenter", center);

        },
        zoomToFeature: function (coords) {
             var feature = new OL.Feature(new OL.geom.Polygon([coords])),
                extent = feature.getGeometry().getExtent();

            Radio.trigger("Map", "zoomToExtent", extent);

        },
        resetView: function () {
            Radio.trigger("MapView", "resetView");
        }
    });

    return RemoteInterface;
});
