define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        _String = require("underscore.string"),
        LocalityModel;

    LocalityModel = Backbone.Model.extend({
        defaults: {
            strschl: "",
            strName: "",
            strHsNr: "",
            strHsNrZusatz: "",
            flurGemarkung: {
                name: "",
                nummer: ""
            },
            flurFlurstueck: "",
            flurStrasse: {
                streetkey: "",
                streetname: ""
            },
            stadtteil: "",
            searchmode: "adresse",
            wpsWorkbenchname: "IDAStreetsInExtent"
        },
        initialize: function () {
            var channel = Radio.channel("LocalityModel");

            this.listenTo(Radio.channel("Searchbar"), {
                "hit": this.searchbarhit
            }, this);
            this.listenTo(Radio.channel("Gaz"), {
                "getAdress": this.adressHit
            }, this);
            this.listenTo(Radio.channel("WPS"), {
                "response": this.setStreetsInExtent
            }, this);

            Radio.on("ParcelSearch", "parcelFound", this.parcelFound, this);
            this.listenTo(this, {
                "change:lage": function () {
                    channel.trigger("newLage", this.getLage());
                },
                "change:flurStrasse": this.checkInputComplete
            });
        },
        /*
         * parcelFound wird gerufen, wenn die Suche ein Flurstück gefunden hat und übernimmt dann die Attribute.
         * Extrahiert die BBOX als WKT. Startet damit die Abfrage nach Straßen.
         */
        parcelFound: function (attr) {
            this.set("flurFlurstueck", attr.flurstuecksnummer);
            this.set("flurGemarkung", {
                name: attr.gemarkungsname,
                nummer: attr.gemarkung
            });
            this.set("stadtteil", attr.kreisname);

            var coordsstring = $(attr.geographicExtent).text(),
                coordsarray = _String.words(coordsstring),
                wktCoords = "POLYGON(())";

            _.each(coordsarray, function (element, index, list) {
                if (index % 2 === 0) { // rechtswerte
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

            Radio.trigger("WPS", "request", {
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
                    var id = streetkeys[index].substring(0, 4),
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
            if (this.get("flurFlurstueck") !== "" && this.get("flurGemarkung").name !== "" && this.get("flurStrasse").streetname !== "") {
                this.setLage({
                    type: "Flurstück",
                    gemarkung: this.get("flurGemarkung"),
                    flurstueck: this.get("flurFlurstueck"),
                    strassendefinition: this.get("flurStrasse"),
                    stadtteil: this.get("stadtteil")
                });
                this.set("header", this.get("flurGemarkung").nummer + "/" + this.get("flurFlurstueck") + "(" + this.get("flurStrasse").streetname + ")");
            }
            else {
                this.setLage("");
                this.set("header", "");
            }
        },
        setParcelStreet: function (streetkey, streetname) {
            this.unset("flurStrasse", {silent: true});
            this.set("flurStrasse", {
                streetkey: streetkey,
                streetname: streetname
            });
        },
        /*
         * reagiert auf Radio, wenn Eintrag der Searchbar geklickt wurde.
         */
        searchbarhit: function (hit) {
            if (hit.type === "Adresse") {
                Radio.trigger("Gaz", "adressSearch", hit.adress);
                this.set("header", hit.adress.streetname + " " + hit.adress.housenumber + hit.adress.affix);
            }
            else {
                this.setLage("");
                this.set("header", "");
            }
        },
        adressHit: function (data) {
            var hit = $("wfs\\:member,member", data)[0],
                zusatzTest,
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
            this.setLage({
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
        },
        setLage: function (value) {
            this.set("lage", value);
        },
        getLage: function () {
            return this.get("lage");
        }
    });

    return LocalityModel;
});
