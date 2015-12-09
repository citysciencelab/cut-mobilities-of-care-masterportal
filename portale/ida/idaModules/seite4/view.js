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
        initialize: function (params, brwList, nutzung, produkt, jahr) {
            this.listenTo(this.model, "change:page", this.refreshPage);

            this.model.set("params", params),
            this.model.set("nutzung", nutzung),
            this.model.set("produkt", produkt),
            this.model.set("jahr", jahr),
            this.model.set("brwList", brwList);

            this.model.startCalculation();
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
        refreshPage: function () {
            var page = this.model.get("page");

            $("#ok_p").append(page);
        }
    });

    return Seite4View;
});
