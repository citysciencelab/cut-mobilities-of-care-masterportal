define([
    "backbone",
    "config",
    "modules/core/util",
    "bootstrap/dropdown",
    "bootstrap/button",
    "bootstrap/collapse"
], function (Backbone, Config, Util) {
    "use strict";
    var GFIModel = Backbone.Model.extend({
        /**
         * Das Model des Mietenspiegels instanziiert sich einmalig sofort.
         */
        defaults: {
            readyState: false,
            msURL: "/wscd0096/fachdaten_public/services/wfs_hh_mietenspiegel", // URL unter der der Mietenspiegel-WFS antwortet
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
            msStadtteil: "-"
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
                this.ladeDaten();
                this.calculateMerkmale();
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
         * Lese Mietenspiegel-Daten aus.
         */
        ladeDaten: function () {
            // lade Mietenspiegel-Metadaten
            $.ajax({
                url: this.get("msURL"),
                data: "REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=app:mietenspiegel_metadaten",
                async: false,
                type: "GET",
                cache: false,
                dataType: "xml",
                context: this,
                success: function (data) {
                    var datum;

                    if (!Util.isInternetExplorer()) {
                        datum = $(data).find("erhebungsstand").text().split("-")
                        this.set("msErhebungsstand", datum[2] + "." + datum[1] + "." + datum[0]);
                        this.set("msHerausgeber", $(data).find("herausgeber").text());
                        this.set("msHinweis", $(data).find("hinweis").text());
                        this.set("msTitel", $(data).find("titel").text());
                        this.set("msMerkmaleText", $(data).find("merkmaletext").text().split("|"));
                    }
                    else {
                        datum = data.childNodes[0].getElementsByTagName("app:erhebungsstand")[0].textContent.split("-");
                        this.set("msErhebungsstand", datum[2] + "." + datum[1] + "." + datum[0]);
                        this.set("msHerausgeber", data.childNodes[0].getElementsByTagName("app:herausgeber")[0].textContent);
                        this.set("msHinweis", data.childNodes[0].getElementsByTagName("app:hinweis")[0].textContent);
                        this.set("msTitel", data.childNodes[0].getElementsByTagName("app:titel")[0].textContent);
                        this.set("msMerkmaleText", data.childNodes[0].getElementsByTagName("app:merkmaletext")[0].textContent.split("|"));
                    }
                },
                error: function (jqXHR, errorText, error) {
                    alert("Fehler beim Laden von Daten: \n" + errorText + error);
                }
            });
            // Lade Mietenspiegel-Daten
            $.ajax({
                url: this.get("msURL"),
                data: "REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=app:mietenspiegel_daten",
                async: false,
                type: "GET",
                cache: false,
                dataType: "xml",
                context: this,
                success: function (data) {
                    var daten = [],
                        keys = this.get("msMerkmaleText");

                    if (!Util.isInternetExplorer()) {
                        $(data).find("mietenspiegel_daten").each(function (index, value) {
                            daten.push({
                                mittelwert: parseFloat($(value).find("mittelwert").text()),
                                spanne_min: parseFloat($(value).find("spanne_min").text()),
                                spanne_max: parseFloat($(value).find("spanne_max").text()),
                                datensaetze: parseInt($(value).find("datensaetze").text()),
                                merkmale: _.object(keys, $(value).find("merkmale").text().split("|"))
                            });
                        });
                    }
                    else {
                        _.each(data.childNodes[0].getElementsByTagName("app:mietenspiegel_daten"), function (element, index) {
                            var mittelwert = parseFloat(element.getElementsByTagName("app:mittelwert")[0].textContent),
                                spanne_min = parseFloat(element.getElementsByTagName("app:spanne_min")[0].textContent),
                                spanne_max = parseFloat(element.getElementsByTagName("app:spanne_max")[0].textContent),
                                datensaetze,
                                merkmale = element.getElementsByTagName("app:merkmale")[0].textContent;

                            if (element.getElementsByTagName("app:datensaetze")[0]) {
                                datensaetze = parseFloat(element.getElementsByTagName("app:datensaetze")[0].textContent);
                            }
                            else {
                                datensaetze = "";
                            }
                            daten.push({
                                mittelwert: mittelwert,
                                spanne_min: spanne_min,
                                spanne_max: spanne_max,
                                datensaetze: datensaetze,
                                merkmale: _.object(keys, merkmale.split("|"))
                            });
                        });
                    }
                    this.set("msDaten", daten);
                    // Prüfe den Ladevorgang
                    if (daten.length > 0 && this.get("msTitel") !== "") {
                        this.set("readyState", true);
                    }
                },
                error: function (jqXHR, errorText, error) {
                    alert("Fehler beim Laden von Daten: \n" + errorText + error);
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
        }
    });

    return new GFIModel;
});
