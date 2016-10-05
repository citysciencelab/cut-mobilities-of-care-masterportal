define([
    "backbone",
    "eventbus",
    "idaModules/4_summary/model",
    "text!idaModules/4_summary/template.html",
    "idaModules/5_netchecker/model"
], function (Backbone, EventBus, Model, Template, Seite5) {
    "use strict";
    var SummaryView = Backbone.View.extend({
        id: "summary",
        model: Model,
        template: _.template(Template),
        events: {
            "click #seite4_weiter": "weiter",
            "click #seite4_back": "zurueck"
        },
        initialize: function (params, brwList, nutzung, produkt, jahr, lage) {
            this.listenTo(this.model, "change:result", this.refreshResult),
            this.listenTo(this.model, "change:error", this.refreshError);

            this.model.set("params", params);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("jahr", jahr);
            this.model.set("lage", lage);
            this.model.set("result", "");
            this.model.set("error", "");
            this.model.startCalculation(brwList);
            this.render();
        },
        weiter: function () {
            new Seite5(this.model.get("filepath"));
        },
        zurueck: function () {
            $("#parameter").show();
            this.remove();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("#parameter").after(this.$el.html(this.template(attr)));
            $("#parameter").hide();
        },
        refreshResult: function () {
            var result = this.model.get("result");

            $("#result_p").addClass("bg-success");
            $("#result_p").removeClass("bg-danger");
            $("#result_p").text(result);
            $("#seite4_weiter").prop("disabled", false);
        },
        refreshError: function () {
            var error = this.model.get("error");

            $("#result_p").addClass("bg-danger");
            $("#result_p").removeClass("bg-success");
            $("#result_p").text(error);
            $("#seite4_weiter").prop("disabled", true);
        }
    });

    return SummaryView;
});
