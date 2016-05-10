define([
    "backbone",
    "openlayers",
    "eventbus",
    "backbone.radio",
    "proj4"
], function () {
    var Backbone = require("backbone"),
        ol = require("openlayers"),
        EventBus = require("eventbus"),
        Radio = require("backbone.radio"),
        proj4 = require("proj4"),
        ImportTool;

    ImportTool = Backbone.Model.extend({
        defaults: {
            text: "",
            features: [],
            source: new ol.source.Vector({useSpatialIndex: false}),
            layer: new ol.layer.Vector(),
            format: new ol.format.KML()
        },

        initialize: function () {
            var channel = Radio.channel("kmlimport");

            // Source von draw-modul holen
            channel.on({
                "setSource": function (source) {
                    this.setSource(source);
                },
                "getSource": function () {
                    Radio.trigger("draw", "setSource", this.getSource());
                }
            }, this);

            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });
            Radio.trigger("draw", "getSource");
        },

        setStatus: function (args) {
            if (args[2] === "kmlimport" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        setText: function (value) {
            this.set("text", value);
        },
        getText: function () {
            return this.get("text");
        },

        setFeatures: function (value) {
            this.set("features", value);
        },
        getFeatures: function () {
            return this.get("features");
        },
        setSource: function (value) {
            this.set("source", value);
        },
        getSource: function () {
            return this.get("source");
        },
        setLayer: function (value) {
            this.set("layer", value);
        },
        getLayer: function () {
            return this.get("layer");
        },
        setFormat: function (value) {
            this.set("format", value);
        },
        getFormat: function () {
            return this.get("format");
        },

        importKML: function () {
            this.getFeaturesFromKML();
            this.transformFeatures();
            this.setStyle();
            this.featuresToMap();
            this.emptyInput();

        },
        // nach import:kml input leeren und button-style zurücksetzen
        emptyInput: function () {
            $("#fakebutton").html("Datei auswählen (keine ausgewählt)");
            if (this.getText() !== "") {
                this.setText("");
                $("#fakebutton").toggleClass("btn-primary");
//                this.setFormat(new ol.format.KML());
//                this.setSource(new ol.source.Vector({useSpatialIndex: false}));
//                this.setLayer(new ol.layer.Vector());
            }
        },
        // features von KML (in "text" gespeichert) einlesen
        getFeaturesFromKML: function () {
            if (this.getText() !== "") {
                var data = this.getText(),
                    format = this.getFormat(),
                    features = format.readFeatures(data);

                this.setFormat(format);
                this.setFeatures(features);
            }
            else {
                EventBus.trigger("alert", "Bitte wählen Sie zuerst eine KML-Datei zum Importieren aus");
            }
        },

        // Workaround der Styles für Punkte und Text
        setStyle: function () {
            var features = this.getFeatures();

             _.each(features, function (feature) {
                 var type = feature.getGeometry().getType();

                 // wenn Punkt-Geometrie
                 if (type === "Point") {
                     // wenn Text
                     if (feature.get("name") !== undefined) {
                         feature.setStyle(this.getTextStyle(feature.get("name")));
                     }
                     else {
                        feature.setStyle(null);
                     }
                 }
            }, this);
        },

        getTextStyle: function (name) {

            return new ol.style.Style({
                text: new ol.style.Text({
                    text: name,
                    fill: new ol.style.Fill({
                        color: "rgba(0, 0, 0, 1)"
                    })
                })
            });
        },

        // Koordinatentransformation
        transformFeatures: function () {
            var features = this.getFeatures();

            _.each(features, function (feature) {
                var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:4326", "EPSG:25832"));

                feature.getGeometry().setCoordinates(transCoord, "XY");
            }, this);
            this.setFeatures(features);
        },

        getProjections: function (sourceProj, destProj) {
//            proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");

            return {
                sourceProj: proj4(sourceProj),
                destProj: proj4(destProj)
            };
        },
        transformCoords: function (geometry, projections) {
            var transCoord = [];

            switch (geometry.getType()) {
                case "Polygon": {
                    transCoord = this.transformPolygon(geometry.getCoordinates(), projections, this);
                    break;
                }
                case "Point": {
                    transCoord = this.transformPoint(geometry.getCoordinates(), projections);
                    break;
                }
                case "LineString": {
                    transCoord = this.transformLine(geometry.getCoordinates(), projections, this);
                    break;
                }
                default: {
                    EventBus.trigger("alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
                }
            }
            return transCoord;
        },
        transformPolygon: function (coords, projections, context) {
            var transCoord = [];

            // multiple Points
            _.each(coords, function (points) {
                _.each(points, function (point) {
                    transCoord.push(context.transformPoint(point, projections));
                });
            }, this);
            return [transCoord];
        },
        transformLine: function (coords, projections, context) {
            var transCoord = [];

            // multiple Points
                _.each(coords, function (point) {
                    transCoord.push(context.transformPoint(point, projections));
                }, this);
            return transCoord;
        },
        transformPoint: function (point, projections) {
            return proj4(projections.sourceProj, projections.destProj, point);
        },
        // Features in die Karte laden
        featuresToMap: function () {
            var features = this.getFeatures(),
                source = this.getSource(),
                layer = this.getLayer();

            source.addFeatures(features);
            layer.setSource(source);
            EventBus.trigger("addLayer", layer);

        }

    });

    return ImportTool;
});
