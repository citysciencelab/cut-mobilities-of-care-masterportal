define(function (require) {
    var ol = require("openlayers"),
        $ = require("jquery"),
        proj4 = require("proj4"),
        Download;

    Download = Backbone.Model.extend({
        defaults: {},
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
        },
        // Die Features
        data: {},
        // das ausgewählte Format
        selectedFormat: $(".file-endings").val(),
        // Die Fromate
        formats: {},
        // Das Modul, das den Download gestartet hat
        caller: {},
        // download button selector
        dlBtnSel: "a.downloadFile",
        setStatus: function (args) { // Fenstermanagement
            if (args[2].get("id") === "download") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
                this.data = {};
                this.formats = {};
            }
        },
        /**
         * Setzt das Model und den View zurück
         * @returns {void}
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
         * @returns {void}
         */
        setData: function (data) {
            this.data = data;
        },
        /**
         * getter für Data
         * @param {Ol.Feature} data Vektor Objekt das heruntergeladen werden kann
         * @returns {void}
         */
        getData: function () {
            return this.data;
        },

        getSelectedFormat: function () {
            return $(".file-endings").val();
        },

        /**
         * setter für Format
         * @param {String} selectedFormat formats die möglich Formate in die die Features umgewandelt werden können
         * @returns {void}
         */
        setSelectedFormat: function (selectedFormat) {
            this.selectedFormat = selectedFormat;
        },

        getFormats: function () {
            return this.formats;
        },
        /**
         * setter für Format
         * @param {String} formats die möglich Formate in die die Features umgewandelt werden können
         * @returns {void}
         */
        setFormats: function (formats) {
            this.formats = formats;
        },

        getCaller: function () {
            return this.caller;
        },
        /**
         * setter für das Tool, dass den Download aufgerufen hat
         * @param {obj} caller -
         * @returns {void}
         */
        setCaller: function (caller) {
            this.caller = caller;
        },

        getDlBtnSel: function () {
            return this.dlBtnSel;
        },

        /**
         * validates Filename
         * @param {string} filename -
         * @returns {void}
         */
        validateFilename: function (filename) {
            var result;

            if (_.isUndefined(filename) || _.isNull(filename)) {
                return false;
            }
            filename.trim();
            result = filename.match(/^[0-9a-zA-Z]+(\.[0-9a-zA-Z]+)?$/);

            if (_.isUndefined(result) || _.isNull(result)) {
                Radio.trigger("Alert", "alert", "Bitte geben Sie einen gültigen Dateinamen ein! (Erlaubt sind Klein-,Großbuchstaben und Zahlen.)");
            }
            return !_.isUndefined(result) && !_.isNull(result);
        },
        appendFileExtension: function (filename, format) {
            var suffix = "." + format;

            if (filename.indexOf(suffix, filename.length - suffix.length) === -1) {
                return filename + "." + format;
            }
            return filename;
        },
        /**
         * Überprüft, ob im Format Selectfeld ein Format ausgewählt wurde.
         * @return {[type]} [description]
         */
        validateFileExtension: function () {
            var format = this.getSelectedFormat();

            if (format === "none" || format === "" || typeof format === "undefined") {
                Radio.trigger("Alert", "alert", "Bitte Format auswählen");
                return false;
            }
            return true;
        },

        /**
         * prepare Convertiert die Übergebenen Daten für den Download und setzt sie hinterher wieder zurück,
         * damit sie weiterhin korrekt angezeigt werden.
         * @returns {converted} converted
         */
        prepareData: function () {

            var backup = this.backupCoords(this.getData()),
                converted;

            converted = this.convert(this.getSelectedFormat(), this.getData());

            this.restoreCoords(this.getData(), backup);
            this.setData(converted);
            return converted;
        },
        /**
         * Gibt zurück, ob der Browser die Microsoft File API unterstützt
         * @return {Boolean} true | false
         */
        isInternetExplorer: function () {
            return window.navigator.msSaveOrOpenBlob;
        },

        /**
         * Stand: 26.04.16 Der IE unterstüzt das HTML5 downlaod Attribut nicht deswegen wird
         * Ein die nur von IE unterstütze File Api verwendet
         * @returns {void}
         */
        prepareDownloadButtonIE: function () {
            var fileData = [this.getData()],
                blobObject = new Blob(fileData),
                that = this;

            $(this.getDlBtnSel()).on("click", function () {
                var filename = $("input.file-name").val();

                if (that.validateFilename(filename)) {
                    if (that.validateFileExtension()) {
                        filename = that.appendFileExtension(filename, that.getSelectedFormat());
                        window.navigator.msSaveOrOpenBlob(blobObject, filename);
                    }
                }
            });
        },
        /**
             * Nutzt das 'HTML% Attribute "Download" um einen localen Download zu ermöglichen.
             * @return {[type]} [description]
             */
        prepareDownloadButtonNonIE: function () {
            var url = "data:text/plain;charset=utf-8,%EF%BB%BF" + encodeURIComponent(this.getData()),
                that = this;

            $(this.getDlBtnSel()).attr("href", url);
            $(this.getDlBtnSel()).on("click", function (e) {
                var filename = $("input.file-name").val();

                if (!that.validateFilename(filename) || !that.validateFileExtension()) {
                    e.preventDefault();
                }
                else {
                    filename = that.appendFileExtension(filename, that.getSelectedFormat());
                    $(that.getDlBtnSel()).attr("download", filename);
                }
            });
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

            a.href = "data:text/json;charset=utf-8," + data;
            a.downloadFile = filename;
            $(a).hide();
            $(".win-body").append(a);
            return a;
        },

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

            return "invalid Format";


        },
        /**
             * Diese funktion wählt anhand der im Dropdown ausgewählten Endung die Konvertier funktion
             * @param  {string} format das Fromat in das konvertiert wird
             * @return {function} die Konvertierfunktion
             */
        getConverter: function (format) {
            var knownFormats = ["kml", "jpg"];

            switch (format) {
                case knownFormats[0]: {
                    return this.convertFeaturesToKML;
                }
                default: {
                    Radio.trigger("Alert", "alert", "Ein Unbekanntes Format wurde an das Download Tool übergeben: <br><strong>" + format + "</strong><br> Bekannte Formate:<br>" + knownFormats);
                }
            }
        },
        /**
         * Transfomiert Geometrische Objekte
         * @param  {object} geometry    Die geometrie die konvertiert werden soll
         * @param  {object} projections Ein Object, dass ausgangs und ziel Projection enthält
         * @return {nubmer[]} transCoord Die transformierten Koordinaten der Geometry
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
                    Radio.trigger("Alert", "alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
                }
            }
            return transCoord;
        },
        /**
         * Transformiert ein Polygon
         * @param  {number[]} coords      Alle Punkte des Polygons
         * @param  {Object} projections Ein Object, dass ausgangs und ziel Projection enthält
         * @param  {Object} context     das Download Model
         * @return {number[]}             [description]
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
         * @param  {ol.Feature} features das Vector Object, dass nach kml konvertiert werden soll
         * @param {object} context -
         * @return {KML-String} das Resultierende KML
         */
        convertFeaturesToKML: function (features, context) {
            var format = new ol.format.KML({extractStyles: true}),
                pointOpacities = [],
                pointColors = [],
                featuresWithPointStyle,
                pointRadiuses = [];

            _.each(features, function (feature) {
                var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:25832", "EPSG:4326", "32")),
                    type,
                    styles,
                    color,
                    style;

                // für den Download nach einem Import! Z-Koordinate absägen
                if (transCoord.length === 3) {
                    transCoord.pop();
                }

                feature.getGeometry().setCoordinates(transCoord, "XY");
                type = feature.getGeometry().getType();
                styles = feature.getStyleFunction().call(feature);
                style = styles[0];

                // wenn Punkt-Geometrie
                if (type === "Point") {
                    // wenn es kein Text ist(also Punkt), werden Farbe, Transparenz und Radius in arrays gespeichert um dann das KML zu erweitern.
                    if (!feature.getStyle().getText()) {
                        color = style.getFill().getColor().split("(")[1].split(",");

                        pointOpacities.push(style.getFill().getColor().split(",")[3].split(")")[0]);
                        pointColors.push(color[0] + "," + color[1] + "," + color[2]);
                        pointRadiuses.push(style.getImage().getRadius());
                    }
                }
            }, context);

            // KML zerlegen und die Punktstyles einfügen
            featuresWithPointStyle = $.parseXML(format.writeFeatures(features));

            $(featuresWithPointStyle).find("Point").each(function (i, point) {
                var placemark = point.parentNode,
                    style,
                    pointStyle;

                // kein Text, muss also Punkt sein
                if (!$(placemark).find("name")[0]) {
                    style = $(placemark).find("Style")[0];
                    pointStyle = "<pointstyle>";

                    pointStyle += "<color>" + pointColors[i] + "</color>";
                    pointStyle += "<transparency>" + pointOpacities[i] + "</transparency>";
                    pointStyle += "<radius>" + pointRadiuses[i] + "</radius>";
                    pointStyle += "</pointstyle>";

                    $(style).append($(pointStyle));
                }

            });
            return new XMLSerializer().serializeToString(featuresWithPointStyle);
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

    return Download;
});
