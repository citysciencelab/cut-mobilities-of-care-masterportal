define([
    "backbone",
    "config",
    "eventbus",
    "modules/core/util",
    "modules/layer/list"
], function (Backbone, Config, EventBus, Util, LayerList) {
    "use strict";
    var GFIModel = Backbone.Model.extend({
        /**
         * Das Model des Mietenspiegels instanziiert sich einmalig sofort.
         */
        defaults: {
            readyState: false,
            msDaten: [],// alle Mietenspiegel-Daten
            msErhebungsstand: "",// fixe Metadaten
            msHerausgeber: "",// fixe Metadaten
            msHinweis: "",// fixe Metadaten
            msTitel: "", // fixe Metadaten
            msMerkmaleText: [], // Array der Merkmalsnamen
            msMerkmale: {}, // Merkmale mit möglichen Werten als Objekt
            msMittelwert: "", // Ergebnis
            msSpanneMin: "", // Ergebnis
            msSpanneMax: "", // Ergebnis
            msDatensaetze: "", // Ergebnis
            msWohnlage: "unbekannte Wohnlage", // per GFI ausgelesene Wohnlage
            msStrasse: "-",
            msPLZ: "-",
            msStadtteil: "-",
            msLayerDaten: "", // Layer der Config mit Mietenspiegel-Daten
            msLayerMetaDaten: "" // Layer der Config mit Mietenspiegel-MetaDaten
        },
        /**
         * Gibt den Print-Content ans popup-Model zurück. Wird als Funktion aufgerufen. Liefert ein Objekt aus.
         */
        returnPrintContent: function () {
            var ms = {
                "Strasse": this.get("msStrasse"),
                "Stadtteil": this.get("msStadtteil"),
                "Ort": this.get("msPLZ") + " Hamburg",
                "Kategorie": this.get("msWohnlage")
            };

            $(".msmerkmal").each(function (element) {
                if (this.value !== "-1") { // = bitte wählen
                    ms = _.extend(ms, _.object([$(this).attr("id")], [$(this).find("option:selected").text()]));
                }
            });
            if (this.get("msMittelwert") !== "") {
                ms = _.extend(ms, _.object(["Mittelwert"], [this.get("msMittelwert").toString()]));
            }
            if (this.get("msSpanneMin") !== "") {
                ms = _.extend(ms, _.object(["Spanne Min."], [this.get("msSpanneMin").toString()]));
            }
            if (this.get("msSpanneMax") !== "") {
                ms = _.extend(ms, _.object(["Spanne Max"], [this.get("msSpanneMax").toString()]));
            }
            if (this.get("msDatensaetze") !== "") {
                ms = _.extend(ms, _.object(["Datensätze"], [this.get("msDatensaetze").toString()]));
            }
            ms = _.extend(ms, _.object(["Herausgeber"], [this.get("msHerausgeber")]));
            ms = _.extend(ms, _.object(["Erhebungsstand"], [this.get("msErhebungsstand")]));
            ms = _.extend(ms, _.object(["Hinweis"], [this.get("msHinweis")]));
            return [ms, "Mietenspiegel-Auswertung"];
        },
        /*
         * Initialize wird immer ausgeführt, auch wenn kein mietenspiegel angezeigt wird.
         * Deshalb prüfen, ob Layerdefinition im Config mit gfiTheme: mietenspiegel gesetzt.
         */
        initialize: function () {
            var ms = _.find(Config.layerIDs, function (layer) {
                return _.values(_.pick(layer, "gfiTheme"))[0] === "mietenspiegel";
            });
            if (ms) {
                // lade Layerinformationen aus Config
                this.set("msLayerDaten", _.find(LayerList.models, function (layer) {
                    return layer.id === "2730";
                }));
                this.set("msLayerMetaDaten", _.find(LayerList.models, function (layer) {
                    return layer.id === "2731";
                }));
                if (!_.isUndefined(this.get("msLayerDaten")) && !_.isUndefined(this.get("msLayerMetaDaten"))) {
                    this.ladeDaten();
                    this.calculateMerkmale();
                }
                else {
                    EventBus.trigger("alert", {text: "<strong>Fehler beim Initialisieren des Moduls</strong> (mietenspiegel)", kategorie: "alert-warning"});
                }
            }
        },
        /*
         * Wird aus View gerufen und gibt Liste möglicher Merkmale zurück
         */
        returnValidMerkmale: function (merkmalId, setted) {
            var daten = this.get("msDaten"),
                merkmale,
                merkmaleReduced,
                possibleValues;

            merkmale = _.map(daten, function (value, key) {
                return value.merkmale;
            });
            merkmaleReduced = _.filter(merkmale, function (value, index, list) {
                return _.isMatch(value, setted);
            });
            possibleValues = _.map(merkmaleReduced, function (merkmal) {
                return _.values(_.pick(merkmal, merkmalId))[0];
            });
            return _.unique(possibleValues);
        },
        /*
         * Lese Mietenspiegel-Daten aus msLayerMetaDaten und msLayerDaten. REQUESTOR kann nicht verwendet werden, weil es geometrielose Dienste sind.
         */
        ladeDaten: function () {
            Util.showLoader();
            var urlMetaDaten = this.get("msLayerMetaDaten").get("url"),
                featureTypeMetaDaten = this.get("msLayerMetaDaten").get("featureType"),
                urlDaten = this.get("msLayerDaten").get("url"),
                featureTypeDaten = this.get("msLayerDaten").get("featureType");

            $.ajax({
                url: Util.getProxyURL(urlMetaDaten),
                data: "REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=" + featureTypeMetaDaten,
                async: false,
                type: "GET",
                cache: false,
                dataType: "xml",
                context: this,
                complete: function (jqXHR) {
                    Util.hideLoader();
                    if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                        EventBus.trigger("alert", {text: "<strong>Dienst antwortet nicht wie erwartet.</strong> Bitte versuchen Sie es später wieder.", kategorie: "alert-warning"});
                    }
                },
                success: function (data) {
                    var hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                        datum = $(hits).find("app\\:erhebungsstand,erhebungsstand")[0].textContent.split("-"),
                        herausgeber = $(hits).find("app\\:herausgeber,herausgeber")[0].textContent,
                        hinweis = $(hits).find("app\\:hinweis,hinweis")[0].textContent,
                        titel = $(hits).find("app\\:titel,titel")[0].textContent,
                        merkmaletext = $(hits).find("app\\:merkmaletext,merkmaletext")[0].textContent.split("|");

                    this.set("msErhebungsstand", datum[2] + "." + datum[1] + "." + datum[0]);
                    this.set("msHerausgeber", herausgeber);
                    this.set("msHinweis", hinweis);
                    this.set("msTitel", titel);
                    this.set("msMerkmaleText", merkmaletext);
                }
            });
            // Lade Mietenspiegel-Daten
            Util.showLoader();
            $.ajax({
                url: Util.getProxyURL(urlDaten),
                data: "REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=" + featureTypeDaten,
                async: false,
                type: "GET",
                cache: false,
                dataType: "xml",
                context: this,
                complete: function (jqXHR) {
                    Util.hideLoader();
                    if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                        EventBus.trigger("alert", {text: "<strong>Dienst antwortet nicht wie erwartet.</strong> Bitte versuchen Sie es später wieder.", kategorie: "alert-warning"});
                    }
                },
                success: function (data) {
                    var hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                        mietenspiegel_daten = $(hits).find("app\\:mietenspiegel_daten,mietenspiegel_daten"),
                        daten = [],
                        keys = this.get("msMerkmaleText");

                    mietenspiegel_daten.each(function (index, value) {
                        daten.push({
                            mittelwert: parseFloat($(value).find("app\\:mittelwert,mittelwert").text()),
                            spanne_min: parseFloat($(value).find("app\\:spanne_min,spanne_min").text()),
                            spanne_max: parseFloat($(value).find("app\\:spanne_max,spanne_max").text()),
                            datensaetze: parseInt($(value).find("app\\:datensaetze,datensaetze").text()),
                            merkmale: _.object(keys, $(value).find("app\\:merkmale,merkmale").text().split("|"))
                        });
                    });
                    this.set("msDaten", daten);
                    // Prüfe den Ladevorgang
                    if (daten.length > 0 && this.get("msTitel") !== "") {
                        this.set("readyState", true);
                    }
                }
            });
        },
        /*
         * Bestimmt alle Inhalte der Comboboxen für die Merkmale anhand der ausgelesenen Daten.
         * Wird nicht mehr genutzt, da returnValidMerkmale
         */
        calculateMerkmale: function () {
            var daten = this.get("msDaten"),
                merkmalnamen = _.object(_.keys(daten[0].merkmale), []),
                merkmale = _.map(daten, function (value, key) {
                    return value.merkmale;
                }),
                merkmaleReduced = _.mapObject(merkmalnamen, function (value, key) {
                    return _.unique(_.pluck(merkmale, key));
                });
            this.set("msMerkmale", merkmaleReduced);
        },
        /*
         * Berechnet die Vergleichsmiete anhand der gesetzten Merkmale aus msDaten.
         */
        calculateVergleichsmiete: function (merkmale) {
            var daten = this.get("msDaten"),
                vergleichsmiete;

            vergleichsmiete = _.filter(daten, function (value, index, list) {
                return _.isMatch(value.merkmale, merkmale);
            });
            if (vergleichsmiete.length !== 1) {
                this.defaultErgebnisse();
                this.trigger("hideErgebnisse");
            }
            else {
                this.set("msMittelwert", vergleichsmiete[0].mittelwert.toString());
                this.set("msSpanneMin", vergleichsmiete[0].spanne_min.toString());
                this.set("msSpanneMax", vergleichsmiete[0].spanne_max.toString());
                if (vergleichsmiete[0].datensaetze > 0) {
                    this.set("msDatensaetze", vergleichsmiete[0].datensaetze);
                }
                else {
                    this.set("msDatensaetze", "> 30");
                }
                this.trigger("showErgebnisse");
            }
        },
        defaultErgebnisse: function () {
            this.set("msMittelwert", "");
            this.set("msSpanneMin", "");
            this.set("msSpanneMax", "");
            this.set("msDatensaetze", "");
        },
        newWindow: function (layer, response, coordinate) {
            this.set("id", _.uniqueId("mietenspiegelTheme"));
            this.set("layer", layer);
            this.set("coordinate", coordinate);
            this.defaultErgebnisse();
            if (response) {
                if (response["Wohnlage typ"] === "normal") {
                    this.set("msWohnlage", "Normale Wohnlage");
                }
                else if (response["Wohnlage typ"] === "gut") {
                    this.set("msWohnlage", "Gute Wohnlage");
                }
                else {
                    this.set("msWohnlage", "unbekannte Wohnlage");
                }
                if (response["Hausnummer zusatz"]) {
                    this.set("msStrasse", response.Strasse + " " + response.Hausnummer + response["Hausnummer zusatz"]);
                }
                else if (response.Hausnummer) {
                    this.set("msStrasse", response.Strasse + " " + response.Hausnummer);
                }
                else {
                    this.set("msStrasse", response.Strasse);
                }
                this.set("msPLZ", response.Plz + " Hamburg");
                this.set("msStadtteil", response.Stadtteil);
            }
            else {
                this.set("msWohnlage", "unbekannte Wohnlage");
                this.set("msStrasse", "-");
                this.set("msPLZ", "-");
                this.set("msStadtteil", "-");
            }
        }
    });

    return new GFIModel;
});
