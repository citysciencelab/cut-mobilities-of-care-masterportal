define([
    "openlayers",
    "backbone",
    "eventbus",
    "backbone.radio",
    "proj4"
], function (ol, Backbone, EventBus, Radio, proj4) {
        var Download = Backbone.Model.extend({
            // Die Features
            data: {},
            // Die Fromate
            formats: {},
            // Das Modul, das den Download gestartet hat
            caller: {},
            initialize: function () {
                 EventBus.on("winParams", this.setStatus, this);
            },
            setStatus: function (args) { // Fenstermanagement
                if (args[2] === "download") {
                    this.set("isCurrentWin", args[0]);
                    this.set("isCollapsed", args[1]);
                }
                else {
                    this.set("isCurrentWin", false);
                    this.data = {};
                    this.formats = {};
                }
            },
            /**
             * Setzt das Model und den View zurück
             */
            cleanUp: function () {
                this.data = {};
                this.formats = {};
                this.caller = {};
                this.removeDom();
            },
            /**
             * setter für Data
             * @param {Ol.Feature} data Vektor Objekt das heruntergeladen werden kann
             */
            setData: function (data) {
                this.data = data;
            },
            /**
             * getter für Format
             */
            getFormats: function () {
                return this.formats;
            },
            /**
             * setter für Format
             * @param {String} formats die möglich Formate in die die Features umgewandelt werden können
             */
             setFormats: function (formats) {
                this.formats = formats;
            },
            /**
             * getter für Caller
             */
            getCaller: function () {
                return this.caller;
            },
            /**
             * setter für das Tool, dass den Download aufgerufen hat
             */
            setCaller: function (caller) {
                this.caller = caller;
            },
            /**
             * Startet den Download eines konvertierten Objektes
             */
            download: function () {
                var filename = $("input.file-name").val(),
                data = this.data,
                converted = {};

                filename.trim();
                if (!filename.match(/^[0-9a-zA-Z ]+(\.[0-9a-zA-Z]+)?$/)) {
                    EventBus.trigger("alert", "Bitte geben Sie einen gültigen Dateinamen ein! (Erlaubt sind Klein-,Großbuchstaben und Zahlen.)");
                }
                else {
                    var format = $(".file-endings").val();

                    if (format === "none") {
                         EventBus.trigger("alert", "Bitte Format auswählen");
                    }
                    else {
                        var backup = this.backupCoords(data);

                        converted = this.convert(format, data);

                        this.restoreCoords(data, backup);
                        if (converted !== "invalid Format") {
                            if (!name.endsWith("." + format)) {
                                filename += "." + format;
                            }
                            var a = this.createDOM(converted, filename);

                            a.click();
                            EventBus.trigger("alert", "Die Datei: <br><strong>" + filename + "</strong><br> wurde in Ihr Downloadverzeichnis heruntergeladen");
                        }
                    }
                }
            },
            backupCoords: function (data) {
                var coords = [];

                _.each(data, function (feature) {
                    coords.push(feature.getGeometry().getCoordinates());
                });
                return coords;
            },
            restoreCoords: function (data, backup) {
                _.each(data, function (feature, index) {
                    feature.getGeometry().setCoordinates(backup[index]);
                });
            },
            /**
             * Erzeugt ein unsichtbares <a> mit Hilfe dessen ein download getriggert werden kann
             * @param  {String} data     Das Objekt, das heruntergeladen werden soll
             * @param  {String} filename Der Dateiname, der herunterzuladenen Daten
             * @return {a-tag}  Ein <a>-Tag das die herunterzuladenen Daten enthält
             */
            createDOM: function (data, filename) {
                var a = document.createElement("a");

                data = "text/json;charset=utf-8," + data;

                a.href = "data:" + data;
                a.download = filename;
                $(a).hide();
                $(".win-body").append(a);
                return a;
            },
            /**
             * Löscht das erzeugt <a> Element
             */
            removeDom: function () {
                $(".win-body a").remove();
            },
            /**
             * Konvertiert ein Feature Objekt in ein Format
             * @param  {string} format das Fromat in das Konvertiert werden soll
             * @param  {ol.Feature} data das Vector Object, dass nach kml konvertiert werden soll
             * @return {Format} das konvertierte Objekt
             */
            convert: function (format, data) {
                var converter = this.getConverter(format);

                if (_.isFunction(converter)) {
                    return converter(data, this);
                }
                else {
                    return "invalid Format";
                }

            },
            /**
             * Diese funktion wählt anhand der im Dropdown ausgewählten Endung die Konvertier funktion
             * ==>!! Neue Formate im Default ausgeben !!<==
             * @param  {string} format das Fromat in das konvertiert wird
             * @return {function} die Konvertierfunktion
             */
            getConverter: function (format) {
                switch (format) {
                    case "kml": {
                        return this.convertFeaturesToKML;
                    }
                    default: {
                        EventBus.trigger("alert", "Unbekanntes Format: <br><strong>" + format + "</strong><br> Bekannte Formate:<br>" + "\"kml\"");
                    }
                }
            },
            /**
             * Transfomiert Geometrische Objekte
             * @param  {Object} geometry    Die geometrie die konvertiert werden soll
             * @param  {Object} projections Ein Object, dass ausgangs und ziel Projection enthält
             * @return {Array or array[array]}  Die transformierten Koordinaten der Geometry
             */
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
            /**
             * Transformiert ein Polygon
             * @param  {array[array]} coords      Alle Punkte des Polygons
             * @param  {Object} projections Ein Object, dass ausgangs und ziel Projection enthält
             * @param  {Object} context     das Download Model
             * @return {array[array]}             [description]
             */
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
            /**
             * Transformiert eine Linie
             * @param  {array} coords      Alle Punkte der Linie
             * @param  {Object} projections Ein Object, dass ausgangs und ziel Projection enthält
             * @param  {Object} context     das Download Model
             * @return {array}             Die Transformierten Punkte
             */
            transformLine: function (coords, projections, context) {

                var transCoord = [];

                // multiple Points
                    _.each(coords, function (point) {
                        transCoord.push(context.transformPoint(point, projections));
                    }, this);
                return transCoord;
            },
            /**
             * Transformiert einen Punkt in eine andere Projektion
             * @param  {array} point       Der zu tranformierende Punkt
             * @param  {Object} projections Ein Object, dass ausgangs und ziel Projection enthält
             * @return {array}             Der transformierte Punkt
             */
            transformPoint: function (point, projections) {
                return proj4(projections.sourceProj, projections.destProj, point);
            },
            /**
             * Konvertiert Features nach KML, benötigt min. OpenLayers 3.12
             * @param  {ol.Feature} data das Vector Object, dass nach kml konvertiert werden soll
             * @return {KML-String} das Resultierende KML
             */
            convertFeaturesToKML: function (features, context) {
                var format = new ol.format.KML();

                _.each(features, function (feature) {
                    var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:25833", "EPSG:4326", "32"));

                    feature.getGeometry().setCoordinates(transCoord, "XY");

                }, context);
                features = format.writeFeatures(features);

                return features;
            },
            /**
             * Erzeugt Projection aus ESPG codes und zone
             * @param  {String} sourceProj ESPG der Ausgangsprojektion
             * @param  {String} destProj   ESPG der Zielprojektion
             * @param  {String} zone       UTM-Zone
             * @return {Object}            Ein Object, das proj4-Projektionen enthält, mit denen Koordinaten umgerechnet werden können
             */
            getProjections: function (sourceProj, destProj, zone) {
                proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");

                return {
                    sourceProj: proj4(sourceProj),
                    destProj: proj4(destProj)
                };
            }
            });

    return new Download;
 });
