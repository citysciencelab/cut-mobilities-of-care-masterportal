define([
    "backbone",
    "backbone.radio",
    "underscore.string",
    "eventbus"
], function (Backbone, Radio, _String, EventBus) {
    "use strict";
    var LocalityModel = Backbone.Model.extend({
        defaults: {
            strschl: "",
            strName: "",
            strHsNr: "",
            strHsNrZusatz: "",
            flurGemarkung: "",
            flurFlurstueck: "",
            flurStrasse: "",
            searchmode: "adresse",
            wpsWorkbenchname: "IDAStreetsInExtent"
        },
        initialize: function () {
            EventBus.on("searchbar:hit", this.searchbarhit, this);
            EventBus.on("gaz:getAdress", this.adressHit, this);
            EventBus.on("wps:response", this.setStreetsInExtent, this);
            Radio.on("ParcelSearch", "parcelFound", this.parcelFound, this);
            this.listenTo(this, "change:flurStrasse", this.checkInputComplete);
        },
        /*
         * parcelFound wird gerufen, wenn die Suche ein Flurstück gefunden hat und übernimmt dann die Attribute.
         * Extrahiert die BBOX als WKT. Startet damit die Abfrage nach Straßen.
         */
        parcelFound: function (attr) {
            this.set("flurFlurstueck", attr.flurstuecksnummer);
            this.set("flurGemarkung", attr.gemarkung);
            this.set("stadtteil", attr.kreisname);

            var coordsstring = $(attr.geographicExtent).text(),
                coordsarray = _String.words(coordsstring),
                wktCoords = "POLYGON(())";

            _.each(coordsarray, function (element, index, list) {
                if (index % 2 == 0) { // rechtswerte
                    wktCoords = _String.insert(wktCoords, wktCoords.length - 2, element + " ");
                }
                else { // hochwerte
                    if (index !== list.length - 1) { // nicht letztes Element
                        wktCoords = _String.insert(wktCoords, wktCoords.length - 2, element + ", ");
                    }
                    else { // letztes Element
                        wktCoords = _String.insert(wktCoords, wktCoords.length - 2, element);
                    }
                }
            });
            this.getStreetsInExtent(wktCoords);
        },
        /*
         * wird aus parcelSearch gerufen und fragt wps nach strassen in extent ab
         */
        getStreetsInExtent: function (wkt) {
            this.set("flurstueckstrassenoptionen", []);
            var dataInputs = "<wps:DataInputs>",
                dataInputs = dataInputs + "<wps:Input>",
                dataInputs = dataInputs + "<ows:Identifier>wellKnownText</ows:Identifier>",
                dataInputs = dataInputs + "<wps:Data>",
                dataInputs = dataInputs + "<wps:LiteralData dataType='string'>" + wkt + "</wps:LiteralData>",
                dataInputs = dataInputs + "</wps:Data>",
                dataInputs = dataInputs + "</wps:Input>",
                dataInputs = dataInputs + "</wps:DataInputs>";

            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsWorkbenchname"),
                dataInputs: dataInputs
            });
        },
        /*
         * Wertet die Straßen im Extent aus
         */
        setStreetsInExtent: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchname")) {
                var streetnames = $(obj.data).find("wps\\:streetnames,streetnames")[0].textContent.split(","),
                    streetkeys = $(obj.data).find("wps\\:streetkeys,streetkeys")[0].textContent.split(","),
                    flurstueckstrassenoptionen = [];

                _.each(streetnames, function (element, index) {
                    var id = element, // streetkeys[index],
                        text = element,
                        option = new Option(text, id);

                    flurstueckstrassenoptionen.push(option);
                });
                this.set("flurstueckstrassenoptionen", flurstueckstrassenoptionen);
            }
        },
        /*
         * Prüft, ob die Flurstücksdefinition vollständig ist und übernimmt die Werte
         */
        checkInputComplete: function () {
            if (this.get("flurFlurstueck") !== "" && this.get("flurGemarkung") !== "" && this.get("flurStrasse") !== "") {
                EventBus.trigger("seite1_lage:newLage", {
                    type: "Flurstück",
                    gemarkung: this.get("flurGemarkung"),
                    flurstueck: this.get("flurFlurstueck"),
                    strassendefinition: this.get("flurStrasse")
                });
                this.set("header", this.get("flurGemarkung") + "/" + this.get("flurFlurstueck") + "(" + this.get("flurStrasse") + ")");
            }
            else {
                EventBus.trigger("seite1_lage:newLage", "");
                this.set("header", "");
            }
        },
        /*
         * reagiert auf Eventbus, wenn Eintrag der Searchbar geklickt wurde.
         */
        searchbarhit: function (hit) {
            if (hit.type === "Adresse") {
                EventBus.trigger("gaz:adressSearch", hit.adress);
                this.set("header", hit.adress.streetname + " " + hit.adress.housenumber + hit.adress.affix);
            }
            else {
                EventBus.trigger("seite1_lage:newLage", "");
                this.set("header", "");
            }
        },
        adressHit: function (data) {
            var hit = $("wfs\\:member,member", data)[0],
                 strschl,
                 strName,
                 strHsNr,
                 strHsNrZusatz,
                 zusatzTest,
                 stadtteil,
                 plz,
                 coordinates = [];

            this.set("strschl", $(hit).find("dog\\:strasse,strasse")[0].textContent);
            this.set("strName", $(hit).find("dog\\:strassenname, strassenname")[0].textContent);
            this.set("strHsNr", $(hit).find("dog\\:hausnummer, hausnummer")[0].textContent);
            this.set("stadtteil", $(hit).find("dog\\:postOrtsteil, postOrtsteil")[0].textContent);
            this.set("plz", $(hit).find("dog\\:postleitzahl, postleitzahl")[0].textContent);
            zusatzTest = $(hit).find("dog\\:hausnummernzusatz, hausnummernzusatz")[0];
            if (zusatzTest) {
                this.set("strHsNrZusatz", zusatzTest.textContent);
            }
            else {
                this.set("strHsNrZusatz", "");
            }
            coordinates = $(hit).find("gml\\:pos, pos")[0].textContent.split(" ");
            EventBus.trigger("seite1_lage:newLage", {
                type: "Adresse",
                strassenschluessel: this.get("strschl"),
                strassenname: this.get("strName"),
                hausnummer: this.get("strHsNr"),
                hausnummerZusatz: this.get("strHsNrZusatz"),
                stadtteil: this.get("stadtteil"),
                plz: this.get("plz"),
                rechtswert: coordinates[0],
                hochwert: coordinates[1]
            });
        }
    });

    return new LocalityModel();
});
