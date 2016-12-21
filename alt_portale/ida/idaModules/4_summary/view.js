define([
    "backbone",
    "eventbus",
    "idaModules/4_summary/model",
    "idaModules/5_netchecker/model"
], function (Backbone, EventBus, Model, Seite5) {
    "use strict";
    var SummaryView = Backbone.View.extend({
        el: "#seite_vier",
        model: Model,
        events: {
            "click #seite4_weiter": "weiter"
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
            new Seite5(this.model.get("filepath"));
        },
        show: function () {
            $("#seite_zwei").hide();
            $("#seite_drei").hide();
            $("#seite_fuenf").hide();
            $("#seite_vier").show();
        },
        refreshResult: function () {
            var result = this.model.get("result");

            $("#result_p").addClass("bg-success");
            $("#result_p").text(result);
            $("#seite4_weiter").prop("disabled", false);
        },
        refreshError: function () {
            var error = this.model.get("error");

            $("#result_p").addClass("bg-danger");
            $("#result_p").text(error);
            $("#seite4_weiter").prop("disabled", true);
        }
    });

    return SummaryView;
});
