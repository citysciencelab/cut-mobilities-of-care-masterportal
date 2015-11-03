define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite1LageModel = Backbone.Model.extend({
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
        },
        searchbarhit: function (hit) {
            if (hit.type === "Adresse") {
                EventBus.trigger("gaz:adressSearch", hit.adress);
            }
        },
        adressHit: function (data) {
             var hit = $("wfs\\:member,member", data)[0],
                 strschl,
                 strName,
                 strHsNr,
                 strHsNrZusatz,
                 zusatzTest;

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
            EventBus.trigger("seite1_lage:newLage", {
                type: "Adresse",
                strschl: this.get("strschl"),
                strName: this.get("strName"),
                strHsNr: this.get("strHsNr"),
                strHsNrZusatz: this.get("strHsNrZusatz")
            });
        }
    });

    return new Seite1LageModel();
});
