import Theme from "../model";

const MietenspiegelTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.setDefaults
        });
    },
    setDefaults: function () {
        if (this.get("gfiContent") !== undefined) {
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
        let ms = {
            "Strasse": this.get("msStrasse"),
            "Stadtteil": this.get("msStadtteil"),
            "Ort": this.get("msPLZ") + " Hamburg",
            "Kategorie": this.get("msWohnlage")
        };

        $(".msmerkmal").each(function () {
            if (this.value !== "-1") { // = bitte wählen
                ms = Object.assign(ms, this.convertTwoArraysToOneObject([$(this).attr("id")], [$(this).find("option:selected").text()]));
            }
        });
        if (this.get("msMittelwert") !== "") {
            ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Mittelwert"], [this.get("msMittelwert").toString()]));
        }
        if (this.get("msSpanneMin") !== "") {
            ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Spanne Min."], [this.get("msSpanneMin").toString()]));
        }
        if (this.get("msSpanneMax") !== "") {
            ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Spanne Max"], [this.get("msSpanneMax").toString()]));
        }
        if (this.get("msDatensaetze") !== "") {
            ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Datensätze"], [this.get("msDatensaetze").toString()]));
        }
        ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Herausgeber"], [this.get("msHerausgeber")]));
        ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Erhebungsstand"], [this.get("msErhebungsstand")]));
        ms = Object.assign(ms, this.convertTwoArraysToOneObject(["Hinweis"], [this.get("msHinweis")]));
        return [ms, "Mietenspiegel-Auswertung"];
    },
    layerListReady: function () {
        this.ladeMetaDaten();
    },
    /*
     * Wird aus View gerufen und gibt Liste möglicher Merkmale zurück
     */
    returnValidMerkmale: function (merkmalId, setted) {
        const daten = this.get("msDaten");

        let merkmale = "",
            merkmaleReduced = "",
            possibleValues = "",
            uniqueValues = "",
            sortedValues = "";

        merkmale = daten.map(value => value.merkmale);
        merkmaleReduced = merkmale.filter(function (value) {
            return Object.entries(setted).forEach(entry => value[entry[0]] === entry[1]);
        });
        possibleValues = merkmaleReduced.map(merkmal => merkmal.merkmalId);
        uniqueValues = [...new Set(possibleValues)];

        if (merkmalId === "Baualtersklasse/Bezugsfertigkeit") {
            // sortiert nach letzten 4 Zeichen (Jahresangabe / Größe)
            sortedValues = uniqueValues.sort((valueA, valueB) => valueA.substring(valueA.length - 4) - valueB.substring(valueB.length - 4));
        }
        else {
            // sortiert nach letzten 4 Zeichen (Jahresangabe / Größe)
            sortedValues = uniqueValues.sort((valueA, valueB) => valueA.substring(0, 1) - valueB.substring(0, 1));

        }
        return sortedValues;
    },
    /*
     * Lese Mietenspiegel-Daten aus msLayerMetaDaten und msLayerDaten. REQUESTOR kann nicht verwendet werden, weil es geometrielose Dienste sind.
     */
    ladeMetaDaten: function () {
        const urlMetaDaten = "http://geodienste.hamburg.de/HH_WFS_Mietenspiegel",
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
                const hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
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
        const urlDaten = "http://geodienste.hamburg.de/HH_WFS_Mietenspiegel",
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
                const hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                    mietenspiegel_daten = $(hits).find("app\\:mietenspiegel_daten,mietenspiegel_daten"),
                    daten = [],
                    keys = this.get("msMerkmaleText");

                mietenspiegel_daten.each((index, value) => {
                    daten.push({
                        mittelwert: parseFloat($(value).find("app\\:mittelwert,mittelwert").text()),
                        spanne_min: parseFloat($(value).find("app\\:spanne_min,spanne_min").text()),
                        spanne_max: parseFloat($(value).find("app\\:spanne_max,spanne_max").text()),
                        datensaetze: parseInt($(value).find("app\\:datensaetze,datensaetze").text(), 10),
                        merkmale: this.convertTwoArraysToOneObject(keys, $(value).find("app\\:merkmale,merkmale").text().split("|"))
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

    /**
     * Converts two arrays to one object.
     * @param {string[]|number[]} keys - Array that contains the keys.
     * @param {string[]|number[]} values - Array that contains the values.
     * @returns {object} The object with the key value pairs.
     */
    convertTwoArraysToOneObject: function (keys, values) {
        const object = {};

        keys.forEach((key, index) => {
            object[key] = values[index];
        });

        return object;
    },

    /*
     * Bestimmt alle Inhalte der Comboboxen für die Merkmale anhand der ausgelesenen Daten.
     * Wird nicht mehr genutzt, da returnValidMerkmale
     */
    calculateMerkmale: function () {
        const daten = this.get("msDaten"),
            merkmalNamen = Object.keys(daten[0].merkmale),
            merkmale = daten.map(value => value.merkmale),
            merkmaleReduced = {};

        merkmalNamen.forEach(merkmalName => {
            merkmaleReduced[merkmalName] = [];
            merkmale.forEach(merkmal => {
                if (!merkmaleReduced[merkmalName].includes(merkmal[merkmalName])) {
                    merkmaleReduced[merkmalName].push(merkmal[merkmalName]);
                }
            });
        });

        this.set("msMerkmale", merkmaleReduced);
        this.set("readyState", true);
    },
    /*
     * Berechnet die Vergleichsmiete anhand der gesetzten Merkmale aus msDaten.
     */
    calculateVergleichsmiete: function (merkmale) {
        const daten = this.get("msDaten"),
            vergleichsmiete = daten.filter(function (value) {
                return Object.entries(merkmale).forEach(entry => value.merkmale[entry[0]] === entry[1]);
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
        this.set("id", Radio.request("Util", "uniqueId", "mietenspiegelTheme"));
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
