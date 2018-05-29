define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Model = require("idaModules/4_overview/summary/model"),
        Template = require("text!idaModules/4_overview/summary/template.html"),
        Config = require("config"),
        SummaryView;

    SummaryView = Backbone.View.extend({
        id: "summary",
        model: new Model(),
        template: _.template(Template),
        events: {
            "click #toggleSummary": "toggleSummary"
        },
        initialize: function (params, nutzung, produkt, jahr, lage) {
            var channel = Radio.channel("SummaryView");

            channel.on({
                "destroy": this.destroy
            }, this);

            Radio.trigger("Info", "setNavStatus", "navbar-4-summary");

            this.model.paramsChanged(params);
            this.model.nutzungChanged(nutzung);
            this.model.produktChanged(produkt);
            this.model.set("jahr", jahr);
            this.model.lageChanged(lage);
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#result").after(this.$el.html(this.template(attr)));
        },
        destroy: function () {
            this.remove();
        },
        toggleSummary: function () {
            $("#summaryDetails").toggle("slow");
            $("#billDetails").toggle("slow");
        },
        /**
         * Reagiert auf den Weiter-Button und initiiert ggf. die Rechnungserstellung oder öffnet netchecker
         * @fires orderBill#Initiiert die Rechnungserstellung
         */
        weiter: function () {
            $("#summary").hide();
            window.location.href = Config.netcheckerURL + "?ORDERID=" + this.model.get("orderid");
        },
        /**
         * Reagiert auf den zurück-Button. Öffnet das vorherige Modul und schließt das aktuelle.
         */
        zurueck: function () {
            Radio.trigger("ParameterView", "show");
            this.remove();
        }
    });

    return SummaryView;
});
