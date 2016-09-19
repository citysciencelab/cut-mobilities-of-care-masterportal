define(function (require) {
    var Radio = require("backbone.radio"),
        MasterRadio,
        Backbone = require("backbone"),
        OL = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("RemoteInterface"),
            context = this;

            channel.on({
                "addFeature": function (f) {
                    this.addFeature(f);
                }
            });
            Radio.trigger("Map", "addLayerToIndex", [this.createLayer(), 0]);
            //Radio.trigger("remoteInterface", "addFeature", {});

           window.onmessage = function(e){
                    context.addFeature(e.data);
                    parent.postMessage('featureAdded', '*');
            };
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
        }
    });

    return RemoteInterface;
});
