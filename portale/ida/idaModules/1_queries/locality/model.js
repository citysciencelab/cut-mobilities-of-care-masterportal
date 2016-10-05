define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
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
            searchmode: "adresse"
        },
        initialize: function () {
            EventBus.on("searchbar:hit", this.searchbarhit, this);
            EventBus.on("gaz:getAdress", this.adressHit, this);
            this.listenTo(this, "change:flurGemarkung", this.flurstueckInput);
            this.listenTo(this, "change:flurFlurstueck", this.flurstueckInput);
            this.listenTo(this, "change:flurStrasse", this.flurstueckInput);
        },
        flurstueckInput: function () {
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
                 coordinates = [];

            this.set("strschl", $(hit).find("dog\\:strasse,strasse")[0].textContent);
            this.set("strName", $(hit).find("dog\\:strassenname, strassenname")[0].textContent);
            this.set("strHsNr", $(hit).find("dog\\:hausnummer, hausnummer")[0].textContent);
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
                rechtswert: coordinates[0],
                hochwert: coordinates[1]
            });
        }
    });

    return new LocalityModel();
});
