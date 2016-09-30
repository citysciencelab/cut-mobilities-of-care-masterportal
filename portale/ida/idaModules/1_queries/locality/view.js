define([
    "jquery",
    "backbone",
    "text!idaModules/1_queries/locality/template.html",
    "config",
    "idaModules/1_queries/locality/model",
    "modules/searchbar/view"
], function ($, Backbone, Template, Config, Model, Searchbar) {
    "use strict";
    var LocalityView = Backbone.View.extend({
        el: "#lage",
        model: Model,
        template: _.template(Template),
        events: {
            "change input[type=radio]": "switchLage", // 'click .toggleRoutingOptions': 'toggleRoutingOptions',
            "change #gemarkungsnummer": "setGemarkungsnummer",
            "keyup #flurstuecksnummer": "setFlurstuecksnummer",
            "keyup #flurstuecksstrasse": "setFlurstuecksstrasse"
        },
        initialize: function () {
            this.render();
            new Searchbar(Config.searchBar);
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
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return LocalityView;
});
