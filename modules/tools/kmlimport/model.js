define([
    "backbone",
    "openlayers",
    "backbone.radio",
    "proj4"
], function () {
    var Backbone = require("backbone"),
        ol = require("openlayers"),
        Radio = require("backbone.radio"),
        proj4 = require("proj4"),
        ImportTool;

    ImportTool = Backbone.Model.extend({
        defaults: {
            text: "",
            features: [],
            format: new ol.format.KML({extractStyles: true})
        },

        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
            var drawLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");

            this.set("layer", drawLayer);
            this.set("source", drawLayer.getSource());
        },

        setStatus: function (args) {
            if (args[2].getId() === "kmlimport") {
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
                $("#btn_import").prop("disabled", true);
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
                Radio.trigger("Alert", "alert", "Bitte wählen Sie zuerst eine KML-Datei zum Importieren aus");
            }
        },

        // Workaround der Styles für Punkte und Text
        setStyle: function () {
            var features = this.getFeatures(),
                kml = jQuery.parseXML(this.get("text")),
                pointStyleColors = [],
                pointStyleTransparencies = [],
                pointStyleRadiuses = [],
                pointStyleCounter = 0;

                // kml parsen und eigenen pointStyle auf Punkt-Features anwenden
            $(kml).find("Point").each(function (i, point) {
                var placemark = point.parentNode;

                // kein Text
                if (!$(placemark).find("name")[0]) {
                    var pointStyle = $(placemark).find("pointstyle")[0],
                        color = $(pointStyle).find("color")[0],
                        transparency = $(pointStyle).find("transparency")[0],
                        radius = $(pointStyle).find("radius")[0];

                        // rgb in array schreiben
                    color = new XMLSerializer().serializeToString(color);
                    color = color.split(">")[1].split("<")[0];
                    pointStyleColors.push(color);
                    // transparenz in array schreiben
                    transparency = new XMLSerializer().serializeToString(transparency);
                    transparency = transparency.split(">")[1].split("<")[0];
                    pointStyleTransparencies.push(transparency);
                    // punktradius in array schreiben
                    radius = new XMLSerializer().serializeToString(radius);
                    radius = parseInt(radius.split(">")[1].split("<")[0]);
                    pointStyleRadiuses.push(radius);
                }
            });

            _.each(features, function (feature) {
                var type = feature.getGeometry().getType(),
                    styles = feature.getStyleFunction().call(feature),
                    style = styles[0];

                // wenn Punkt-Geometrie
                if (type === "Point") {
                    // wenn Text
                    if (feature.get("name") !== undefined) {
                        feature.setStyle(this.getTextStyle(feature.get("name"), style));
                    }
                    // wenn Punkt
                    else {
                        var style = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: pointStyleRadiuses[pointStyleCounter],
                                fill: new ol.style.Fill({
                                    color: "rgba(" + pointStyleColors[pointStyleCounter] + ", " + pointStyleTransparencies[pointStyleCounter] + ")"
                                })
                            })
                        });

                        feature.setStyle(style);
                        pointStyleCounter++;
                    }
                }
            }, this);


        },

        getTextStyle: function (name, style) {
            return new ol.style.Style({
                text: new ol.style.Text({
                    text: name,
                    font: "8px Arial",
                    fill: style.getText().getFill(),
                    scale: style.getText().getScale()
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
                    Radio.trigger("Alert", "alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
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
            point.pop();
            return proj4(projections.sourceProj, projections.destProj, point);
        },
        // Features in die Karte laden
        featuresToMap: function () {
            var features = this.getFeatures(),
                source = this.getSource();

            source.addFeatures(features);
        }

    });

    return ImportTool;
});
