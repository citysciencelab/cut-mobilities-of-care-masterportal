define([
    "underscore",
    "backbone",
    "openlayers",
    "eventbus"
], function (_, Backbone, ol, EventBus) {

    var Draw = Backbone.Model.extend({

        "defaults": {
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fc8d62',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                      radius: 7,
                      fill: new ol.style.Fill({
                        color: '#fc8d62'
                      })
                    })
                   }),
            type: "Point"
        },

        "initialize": function () {
            EventBus.on("winParams", this.setStatus, this);
            this.on("change:type", this.createInteraction, this);

            this.set("layer", new ol.layer.Vector({
                source: this.get("source"),
                style: this.get("style")
            }));

            EventBus.trigger("addLayer", this.get("layer"));
        },

        "setStatus": function (args) {
            if (args[2] === "draw" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.createInteraction();
            }
            else {
                this.set("isCurrentWin", false);
                EventBus.trigger("activateGFI");
                EventBus.trigger("removeInteraction", this.get("draw"));
            }
        },

        "createInteraction": function () {
            EventBus.trigger("removeInteraction", this.get("draw"));
            this.set('draw', new ol.interaction.Draw({
                source: this.get('source'),
                type: this.get("type")
            }));
            EventBus.trigger("addInteraction", this.get("draw"));
        },

        /**
         * Setzt den Typ der Geometrie (Point, LineString oder Polygon).
         * @param {String} value - Typ der Geometrie
         */
        "setGeometryType": function (value) {
            this.set("type", value);
        },

        /**
         * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
         */
        "deleteFeatures": function () {
            // lösche alle Geometrien
            this.get("source").clear();
        }
    });

    return new Draw();
});
