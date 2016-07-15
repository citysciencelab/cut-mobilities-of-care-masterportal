define([
    "backbone",
    "eventbus",
    "idaModules/seite4/model"/*,
    "idaModules/seite5/view"*/
], function (Backbone, EventBus, Model, Seite5) {
    "use strict";
    var Seite4View = Backbone.View.extend({
        el: "#seite_vier",
        model: Model,
        events: {
            "click #seite3_weiter": "weiter",
            "change #requestedParamsListe": "paramChanged"
        },
        initialize: function (params, brwList, nutzung, produkt, jahr, lage) {
            this.listenTo(this.model, "change:result", this.refreshResult),
            this.listenTo(this.model, "change:error", this.refreshError);

            this.model.set("params", params);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("jahr", jahr);
            this.model.set("lage", lage);
            this.model.startCalculation(brwList);
            this.show();
        },
        weiter: function () {
            new Seite5();
        },
        show: function () {
            $("#seite_drei").hide();
            $("#seite_fuenf").hide();
            $("#seite_vier").show();
        },
        refreshResult: function () {
            var result = this.model.get("result"),
                filepath = this.model.get("filepath");

            $("#ok_p").append(result);
            $("#ok_ref").attr("href", "https://geoportal-hamburg.de/ida/results/" + filepath);
        },
        refreshError: function () {
            var error = this.model.get("error");

            $("#fehler_p").append(error);
        }
    });

    return Seite4View;
});
