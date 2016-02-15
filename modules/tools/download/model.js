define([
    "openlayers",
    "backbone",
    "eventbus",
    "backbone.radio"
], function (ol, Backbone, EventBus, Radio) {
        var Download = Backbone.Model.extend({
            data: {},
            formats: {},
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
                }
            },
            /**
             * setter für Data
             * @param {Ol.Feature} data Vektor Objekt das heruntergeladen werden kann
             */
            setData: function (data) {
                this.data = data;
            },
            /**
             * [getFormats description]
             * @return {[type]} [description]
             */
            getFormats: function () {
                return this.formats;
            },
            /**
             * setter für Format
             * @param {String} formats die möglich Fromate in die die Features umgewandelt werden können
             */
             setFormats: function (formats) {
                this.formats = formats;
            },
            /**
             * Startet den Download einer nach vorgaben der Form konvertierten Objektes
             */
            download: function () {
                var filename = $("input.file-name").val(),
                data = this.data;

                if (filename === "") {
                    EventBus.trigger("alert", "Bitte geben Sie einen Dateinamen ein!");
                }
                else {
                    var format = $(".file-endings").val();

                    if (format === "none") {
                         EventBus.trigger("alert", "Bitte Format auswählen");
                    }
                    else {
                        data = this.convert(format, data);
                        if (data !== "invalid Format"){
                            if (!name.endsWith("." + format)) {
                                filename += "." + format;
                            }
                            var a = this.createDOM(data, filename);

                            a.click();
                            EventBus.trigger("alert", "Die Datei: <br><strong>" + filename + "</strong><br> wurde in Ihr Downloadverzeichnis heruntergeladen");
                        }
                    }
                }
            },
            /**
             * Erzeugt ein unsichtbares <a> mit Hilfe dessen ein download getriggert werden kann
             * @param  {String} data     Das Objekt, das heruntergeladen werden soll
             * @param  {String} filename Der Dateiname, der herunterzuladenen Daten
             * @return {a-tag}  Ein <a>-Tag das die herunterzuladenen Daten enthält
             */
            createDOM: function (data, filename) {
                var a = document.createElement("a");

                data = "text/json;charset=utf-8," + data ; //JSON.stringify(data);

                a.href = "data:" + data;
                a.download = filename;
                $(a).hide();
                $(".win-body").append(a);
                return a;
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
                    return converter(data);
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
             * Konvertiert Features nach KML, benötigt min. OpenLayers 3.13
             * @param  {ol.Feature} data das Vector Object, dass nach kml konvertiert werden soll
             * @return {KML-String} das Resultierende KML
             */
            convertFeaturesToKML: function (data) {
                var view = Radio.request("map", "getView");
                debugger;
                var format = new ol.format.KML();
                data[0].getGeometry().transform(view.getProjection(), ol.proj.get("EPSG:4326"));
                data = format.writeFeatures(data);
                return data;
            }
        });

    return new Download;
 });
