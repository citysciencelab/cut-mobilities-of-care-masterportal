define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        OL = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        initialize: function () {

            var channel = Radio.channel("remoteInterface");

            channel.on({
                "addFeature": this.addFeature
            });
            Radio.trigger("Map", "addLayerToIndex", [this.createLayer(), 0]);
            //Radio.trigger("remoteInterface", "addFeature", {});
        },
        addFeature: function (coords) {
            debugger;
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
        }
    });

    return RemoteInterface;
});
