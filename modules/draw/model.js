define([
    "backbone",
    "openlayers",
    "eventbus",
    "backbone.radio"
], function (Backbone, ol, EventBus, Radio) {

    var Draw = Backbone.Model.extend({

        defaults: {
            source: new ol.source.Vector(),
            types: ["Point", "LineString", "Polygon"],
            colors: [
                { name: "Orange", value: "rgba(255, 127, 0, 0.5)" },
                { name: "Grau", value: "rgba(153, 153, 153, 0.5)" },
                { name: "Rot", value: "rgba(228, 26, 28, 0.5)" },
                { name: "Blau", value: "rgba(55, 126, 184, 0.5)" },
                { name: "Grün", value: "rgba(77, 175, 74, 0.5)" },
                { name: "Gelb", value: "rgba(255, 255, 51, 0.5)" },
                { name: "Schwarz", value: "rgba(0, 0, 0, 0.5)" },
                { name: "Weiß", value: "rgba(255, 255, 255, 0.5)" }
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
            opacity: [
                {name: "0 %", value: "1.0"},
                {name: "10 %", value: "0.9"},
                {name: "20 %", value: "0.8"},
                {name: "30 %", value: "0.7"},
                {name: "40 %", value: "0.6"},
                {name: "50 %", value: "0.5"},
                {name: "60 %", value: "0.4"},
                {name: "70 %", value: "0.3"},
                {name: "80 %", value: "0.2"},
                {name: "90 %", value: "0.1"}
            ],
            selectedType: "Point",
            selectedOpacity: "0.5",
            color: "rgba(255, 127, 0, 0.5)",
            radius: 6,
            selectedStrokeWidth: 1
        },

        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus,
                "getDrawlayer": this.getLayer
            });

            this.listenTo(this, {
                "change:drawendCoords": this.triggerDrawendCoords,
                "change:selectedType change:style": this.createInteraction,
                "change:color change:radius change:selectedStrokeWidth": this.setStyle
            });

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
                this.setDrawendCoords(evt.feature.getGeometry());
                evt.feature.setStyle(this.get("style"));
            }, this);
            EventBus.trigger("addInteraction", this.get("draw"));
        },

        setDrawendCoords: function (geom) {
            var geoJSON = new ol.format.GeoJSON();

            this.set("drawendCoords", geoJSON.writeGeometry(geom));
        },

        triggerDrawendCoords: function () {
            EventBus.trigger("getDrawendCoords", this.get("drawendCoords"));
        },

        /**
         * Setzt den Typ der Geometrie (Point, LineString oder Polygon).
         * @param {String} value - Typ der Geometrie
         */
        setType: function (value) {
            this.set("selectedType", value);
            if (this.get("selectedType") !== "Point") {
                this.set("radius", 6);
            }
        },

        setColor: function (value) {
            var color = value.substr(0, value.length - 4) + this.get("selectedOpacity");

            this.set("color", color + ")");
        },

        setPointRadius: function (value) {
            this.set("radius", parseInt(value, 10));
        },

        setStrokeWidth: function (value) {
            this.set("selectedStrokeWidth", parseInt(value, 10));
        },

        setOpacity: function (value) {
            var color;

            this.set("selectedOpacity", parseFloat(value, 10).toFixed(1));
            color = this.get("color").substr(0, this.get("color").length - 4) + this.get("selectedOpacity");
            this.set("color", color + ")");
        },

        setStyle: function () {
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: this.get("color")
                }),
                stroke: new ol.style.Stroke({
                    color: this.get("color").substr(0, this.get("color").length - 6) + ", 1)",
                    width: this.get("selectedStrokeWidth")
                }),
                image: new ol.style.Circle({
                    radius: this.get("radius"),
                    fill: new ol.style.Fill({
                        color: this.get("color")
                    })
                })
            });

            this.set("style", style);
        },

        // Löscht alle Geometrien
        deleteFeatures: function () {
            this.get("source").clear();
        },

        getLayer: function () {
            EventBus.trigger("sendDrawLayer", this.get("layer"));
        },

        getKML: function () {
            var features = this.get("layer").getSource().getFeatures();
            var view = Radio.request("map", "getView");

            var format = new ol.format.KML({
                dataProjection: view.getProjection()
            });
            console.log(format);
             console.log(format.writeFeatures(features));
        }

    });

    return new Draw();
});
