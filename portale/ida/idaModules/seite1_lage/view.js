define([
    "jquery",
    "backbone",
    "idaModules/seite1_lage/model",
    "modules/searchbar/view"
], function ($, Backbone, Model, Searchbar) {
    /*
     *
     */
    var Seite1LageView = Backbone.View.extend({
        el: "#lage",
        model: Model,
        events: {
            "change input[type=radio]": "switchLage", // 'click .toggleRoutingOptions': 'toggleRoutingOptions',
            "keyup #gemarkungsnummer": "setGemarkungsnummer",
            "keyup #flurstuecksnummer": "setFlurstuecksnummer",
            "keyup #flurstuecksstrasse": "setFlurstuecksstrasse"
        },
        initialize: function () {
            new Searchbar({
                gazetteer: {
                    minChars: 3,
                    url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                    searchStreets: true,
                    searchHouseNumbers: true
                },
                placeholder: "Suche nach Adresse (Straße/Hausnummer)",
                renderToDOM: "#adressfeld"
            });
        },
        switchLage: function (evt) {
            if (evt.target.value === "radio1") {
                this.model.set("searchmode", "adresse");
                $("#adresse").show();
                $("#gemarkung").hide();
            }
            else {
                this.model.set("searchmode", "parcel");
                $("#gemarkung").show();
                $("#adresse").hide();
            }
        },
        setGemarkungsnummer: function (evt) {
            this.model.set("flurGemarkung", evt.currentTarget.value);
        },
        setFlurstuecksnummer: function (evt) {
            this.model.set("flurFlurstueck", evt.currentTarget.value);
        },
        setFlurstuecksstrasse: function (evt) {
            this.model.set("flurStrasse", evt.currentTarget.value);
        }
    });

    return new Seite1LageView;
});
