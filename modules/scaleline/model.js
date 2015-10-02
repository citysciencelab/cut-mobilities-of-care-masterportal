define([
    "backbone",
    "eventbus",
    "config",
    "modules/core/mapView"
], function (Backbone, EventBus, Config, mapView) {
    "use strict";
    var ScaleLine = Backbone.Model.extend({

        /**
         *
         */
        initialize: function () {
            this.listenTo(EventBus, {
                "mapView:sendOptions": this.setScaleValue
            });

            this.listenTo(this, "change:scaleValue", this.setScale);
            this.listenTo(this, "change:scale", this.setReflength);
            this.set("scaleValue", mapView.get("startScale"));
            EventBus.trigger("mapView:getOptions");
        },

        /**
         *
         */
        setScaleValue: function (obj) {
            this.set("scaleValue", obj.scale);
        },

        /**
         *
         */
        setScale: function () {
            var scale,
                scaleValue;

            scaleValue = this.get("scaleValue").toString();

            if (this.get("scaleValue") >= 1000) {
                scale = "Maßstab = 1: " + scaleValue.substring(0, scaleValue.length - 3) + "." + scaleValue.substring(scaleValue.length - 3);
            }
            else {
                scale = "Maßstab = 1: " + scaleValue;
            }
            this.set("scale", scale);
        },

        /**
         *
         */
        setReflength: function () {
            // reflength beziehtr sich auf 2cm lange Linie
            var reflength,
                reflengthval;

            reflengthval = Math.round(0.02 * this.get("scaleValue"));

            if (reflengthval >= 1000) {
                reflength = (reflengthval / 1000).toString() + " km";
            }
            else {
                reflength = reflengthval.toString() + " m";
            }
            this.set("reflength", reflength);
        }
    });

    return new ScaleLine();
});
