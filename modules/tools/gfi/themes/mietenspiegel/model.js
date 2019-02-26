import Theme from "../model";

const MietenspiegelTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.setDefaults
        });
    },
    setDefaults: function () {
        if (_.isUndefined(this.get("gfiContent")) === false) {
            this.set("readyState", false);
            this.set("msDaten", []);
            this.set("msErhebungsstand", "");
            this.set("msHerausgeber", "");
            this.set("msHinweis", "");
            this.set("msTitel", "");
            this.set("msMerkmaleText", []);
            this.set("msMerkmale", {});
            this.set("msMittelwert", "");
            this.set("msSpanneMin", "");
            this.set("msSpanneMax", "");
            this.set("msDatensaetze", "");
            this.set("msWohnlage", "unbekannte Wohnlage");
            this.set("msStrasse", "-");
            this.set("msPLZ", "-");
            this.set("msStadtteil", "-");
            this.set("msLayerDaten", "");
            this.set("msLayerMetaDaten", "");
        }
        this.layerListReady();
    },

    /**
     * Gibt den Print-Content ans popup-Model zurück. Wird als Funktion aufgerufen. Liefert ein Objekt aus.
     * @returns {object} print content
     */
    returnPrintContent: function () {
        var ms = {
            "Strasse": this.get("msStrasse"),
            "Stadtteil": this.get("msStadtteil"),
            "Ort": this.get("msPLZ") + " Hamburg",
            "Kategorie": this.get("msWohnlage")
        };

        $(".msmerkmal").each(function () {
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
    layerListReady: function () {
        // var layerList = Radio.request("LayerList", "getLayerList");

        // if (layerList.length > 0) {
        // lade Layerinformationen aus Config
        // this.set("msLayerDaten", _.find(layerList, function (layer) {
        // return layer.id === "2730" || layer.id === "2830";
        // }));
        // this.set("msLayerMetaDaten", _.find(layerList, function (layer) {
        // return layer.id === "2731" || layer.id === "2831";
        // }));
        // if (!_.isUndefined(this.get("msLayerDaten")) && !_.isUndefined(this.get("msLayerMetaDaten"))) {
        this.ladeMetaDaten();
        // }
        // else {
        // Radio.trigger("Alert", "alert", {text: "<strong>Fehler beim Initialisieren des Moduls</strong> (mietenspiegel)", kategorie: "alert-warning"});
        // }
        // }
    },
    /*
     * Wird aus View gerufen und gibt Liste möglicher Merkmale zurück
     */
    returnValidMerkmale: function (merkmalId, setted) {
        var daten = this.get("msDaten"),
            merkmale,
            merkmaleReduced,
            possibleValues,
            uniqueValues,
            sortedValues;

        merkmale = _.map(daten, function (value) {
            return value.merkmale;
        });
        merkmaleReduced = merkmale.filter(function (value) {
            return _.isMatch(value, setted);
        });
        possibleValues = _.map(merkmaleReduced, function (merkmal) {
            return _.values(_.pick(merkmal, merkmalId))[0];
        });
        uniqueValues = _.unique(possibleValues);

        if (merkmalId === "Baualtersklasse/Bezugsfertigkeit") {
            // sortiert nach letzten 4 Zeichen (Jahresangabe / Größe)
            sortedValues = _.sortBy(uniqueValues, function (val) {
                return val.substring(val.length - 4);
            });
        }
        else {
            // sortiert nach letzten 4 Zeichen (Jahresangabe / Größe)
            sortedValues = _.sortBy(uniqueValues, function (val) {
                return val.substring(0, 1);
            });
        }
        return sortedValues;
    },
    /*
     * Lese Mietenspiegel-Daten aus msLayerMetaDaten und msLayerDaten. REQUESTOR kann nicht verwendet werden, weil es geometrielose Dienste sind.
     */
    ladeMetaDaten: function () {
        var urlMetaDaten = "http://geodienste.hamburg.de/HH_WFS_Mietenspiegel",
            featureTypeMetaDaten = "app:mietenspiegel_metadaten";

        Radio.trigger("Util", "showLoader");
        $.ajax({
            url: Radio.request("Util", "getProxyURL", urlMetaDaten),
            data: "REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=" + featureTypeMetaDaten,
            async: true,
            type: "GET",
            cache: false,
            dataType: "xml",
            context: this,
            complete: function (jqXHR) {
                Radio.trigger("Util", "hideLoader");
                if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                    Radio.trigger("Alert", "alert", {text: "<strong>Dienst antwortet nicht wie erwartet.</strong> Bitte versuchen Sie es später wieder.", kategorie: "alert-warning"});
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
                this.ladeDaten();
            }
        });
    },
    ladeDaten: function () {
        // Lade Mietenspiegel-Daten
        var urlDaten = "http://geodienste.hamburg.de/HH_WFS_Mietenspiegel",
            featureTypeDaten = "app:mietenspiegel_daten";

        Radio.trigger("Util", "showLoader");
        $.ajax({
            url: Radio.request("Util", "getProxyURL", urlDaten),
            data: "REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=" + featureTypeDaten,
            async: true,
            type: "GET",
            cache: false,
            dataType: "xml",
            context: this,
            complete: function (jqXHR) {
                Radio.trigger("Util", "hideLoader");
                if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                    Radio.trigger("Alert", "alert", {text: "<strong>Dienst antwortet nicht wie erwartet.</strong> Bitte versuchen Sie es später wieder.", kategorie: "alert-warning"});
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
                        datensaetze: parseInt($(value).find("app\\:datensaetze,datensaetze").text(), 10),
                        merkmale: _.object(keys, $(value).find("app\\:merkmale,merkmale").text().split("|"))
                    });
                });
                this.set("msDaten", daten);
                // Prüfe den Ladevorgang
                if (daten.length > 0 && this.get("msTitel") !== "") {
                    this.calculateMerkmale();
                }
                else {
                    Radio.trigger("Alert", "alert", {text: "<strong>Fehlende Wohnlagendaten.</strong> Dieses Portal ist derzeit nicht einsatzbereit. Bitte versuchen Sie es später erneut.", kategorie: "alert-warning"});
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
            merkmale = _.map(daten, function (value) {
                return value.merkmale;
            }),
            merkmaleReduced = _.mapObject(merkmalnamen, function (value, key) {
                return _.unique(_.pluck(merkmale, key));
            });

        this.set("msMerkmale", merkmaleReduced);
        this.set("readyState", true);
    },
    /*
     * Berechnet die Vergleichsmiete anhand der gesetzten Merkmale aus msDaten.
     */
    calculateVergleichsmiete: function (merkmale) {
        var daten = this.get("msDaten"),
            vergleichsmiete;

        vergleichsmiete = daten.filter(function (value) {
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
            this.set("msWohnlage", response.Bezeichnung);
            if (response["Hausnummer zusatz"]) {
                this.set("msStrasse", response.Strasse + " " + response.Hausnummer + response["Hausnummer zusatz"]);
            }
            else if (response.Hausnummer) {
                this.set("msStrasse", response.Strasse + " " + response.Hausnummer);
            }
            else {
                this.set("msStrasse", response.Strasse);
            }
            this.set("msPLZ", response.Plz + " " + response.Ort);
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

export default MietenspiegelTheme;
