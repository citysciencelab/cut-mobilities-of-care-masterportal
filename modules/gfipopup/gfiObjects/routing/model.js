define([
    "backbone",
    "openlayers",
    "eventbus"
], function (Backbone, ol, EventBus) {
    "use strict";
    var RoutingModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
        },
        /**
         *
         */
        initialize: function () {
            this.set("id", _.uniqueId("routenbutton"));
            EventBus.on("mapView:replyProjection", this.setProjection, this);
            EventBus.trigger("mapView:requestProjection");
            this.createRouteLayer();
        },

        setProjection: function (proj) {
            this.set("projection", proj);
        },

        createRouteLayer: function () {
            this.set("routeLayer", new ol.layer.Vector({
                source: new ol.source.Vector({
                    projection: this.get("projection")
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "blue",
                        width: 5
                    })
                })
            }));
        },

        /**
         * Enfernt den "Route-Layer" von der Karte.
         */
        clearRoute: function () {
            this.get("routeLayer").getSource().clear();
            EventBus.trigger("removeLayer", this.get("routeLayer"));
        },

        /**
         * Zeigt die ausgewählte Route.
         * @param  {String} target - Ziel der Route
         */
        showRoute: function (target) {
            var feature = new ol.Feature({
                geometry: this.get("route"),
                name: target
            });
            this.get("routeLayer").getSource().clear();
            this.get("routeLayer").getSource().addFeature(feature);

            EventBus.trigger("addLayer", this.get("routeLayer"));
            EventBus.trigger("zoomToExtent", feature.getGeometry().getExtent());
        },

        destroy: function () {
            this.clearRoute();
            this.unbind();
            this.clear({silent: true});
        }
    });
    return RoutingModel;
});
