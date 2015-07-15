define([
    "backbone",
    "openlayers",
    "eventbus",
    "geoapi"
], function (Backbone, ol, EventBus, GeoAPI) {

    var Draw = Backbone.Model.extend({

        defaults: {
            source: new ol.source.Vector(),
            types: [
                { name: "Point", value: "Point" },
                { name: "LineString", value: "LineString" },
                { name: "Polygon", value: "Polygon" }
            ],
            colors: [
                { name: "Grau", value: "#999999" },
                { name: "Orange", value: "#fc8d62" },
                { name: "Rot", value: "#e31a1c" },
                { name: "Blau", value: "#1f78b4" },
                { name: "Grün", value: "#33a02c" },
                { name: "Gelb", value: "#ffff33" },
                { name: "Schwarz", value: "#000000" },
                { name: "Weiß", value: "#ffffff" }
            ],
            pointRadiuses: [
                { name: "6 px", value: 6 },
                { name: "8 px", value: 8 },
                { name: "10 px", value: 10 },
                { name: "12 px", value: 12 },
                { name: "14 px", value: 14 },
                { name: "16 px", value: 16 }
            ],
            strokeWidth: [
                { name: "1 px", value: 1 },
                { name: "2 px", value: 2 },
                { name: "3 px", value: 3 },
                { name: "4 px", value: 4 },
                { name: "5 px", value: 5 },
                { name: "6 px", value: 6 }
            ],
            selectedType: "Point",
            selectedColor: "#fc8d62",
            selectedRadius: 6,
            selectedStrokeWidth: 1
        },

        initialize: function () {
            EventBus.on("winParams", this.setStatus, this);
            EventBus.on("getDrawlayer", this.getLayer, this);
            this.on("change:selectedType change:style", this.createInteraction, this);
            this.on("change:selectedColor change:selectedRadius change:selectedStrokeWidth", this.setStyle, this);

            this.set("layer", new ol.layer.Vector({
                source: this.get("source")
            }));
            EventBus.trigger("addLayer", this.get("layer"));
        },

        setStatus: function (args) {
            if (args[2] === "draw" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.setStyle();
                this.createInteraction();
            }
            else {
                this.set("isCurrentWin", false);
                EventBus.trigger("removeInteraction", this.get("draw"));
            }
        },

        createInteraction: function () {
            EventBus.trigger("removeInteraction", this.get("draw"));
            this.set("draw", new ol.interaction.Draw({
                source: this.get("source"),
                type: this.get("selectedType"),
                style: this.get("style")
            }));
            this.get("draw").on("drawend", function (evt) {
                GeoAPI.trigger("getDrawCoords", evt.feature.getGeometry().getCoordinates());
                evt.feature.setStyle(this.get("style"));
            }, this);
            EventBus.trigger("addInteraction", this.get("draw"));
        },

        /**
         * Setzt den Typ der Geometrie (Point, LineString oder Polygon).
         * @param {String} value - Typ der Geometrie
         */
        setType: function (value) {
            this.set("selectedType", value);
            if (this.get("selectedType") !== "Point") {
                this.set("selectedRadius", 6);
            }
        },

        setColor: function (value) {
            this.set("selectedColor", value);
        },

        setPointRadius: function (value) {
            this.set("selectedRadius", parseInt(value, 10));
        },

        setStrokeWidth: function (value) {
            this.set("selectedStrokeWidth", parseInt(value, 10));
        },

        setStyle: function () {
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: this.get("selectedColor")
                }),
                stroke: new ol.style.Stroke({
                    color: this.get("selectedColor"),
                    width: this.get("selectedStrokeWidth")
                }),
                image: new ol.style.Circle({
                    radius: this.get("selectedRadius"),
                    fill: new ol.style.Fill({
                        color: this.get("selectedColor")
                     })
                })
            });

            this.set("style", style);
        },

        /**
         * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
         */
        deleteFeatures: function () {
            // lösche alle Geometrien
            this.get("source").clear();
        },

        getLayer: function () {
            EventBus.trigger("sendDrawLayer", this.get("layer"));
        }
    });

    return new Draw();
});
