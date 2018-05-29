define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        Model = require("idaModules/4_overview/model"),
        Template = require("text!idaModules/4_overview/template.html"),
        Billing = require("idaModules/4_overview/billing/view"),
        Summary = require("idaModules/4_overview/summary/view"),
        OverviewView;

    OverviewView = Backbone.View.extend({
        id: "overview",
        template: _.template(Template),
        events: {
            "click #seite4_weiter": "weiter",
            "click #seite4_back": "zurueck"
        },
        initialize: function (params, brwList, nutzung, produkt, jahr, lage) {
            var channel = Radio.channel("Overview");

            channel.on({
                "show": this.show,
                "destroy": this.destroy
            }, this);

            this.model = new Model();

            Radio.trigger("Info", "setNavStatus", "navbar-4-summary");

            this.model.set("params", params);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("jahr", jahr);
            this.model.set("lage", lage);
            this.model.set("result", "");
            this.model.set("error", "");
            this.model.startCalculation(brwList);

            // Listener
            this.listenTo(this.model, "change:result", this.refreshResult),
            this.listenTo(this.model, "change:error", this.refreshError);
            this.listenTo(this.model, "change:hints", this.refreshHints);

            this.render();

            // Erzeuge Billing-Modul nach render
            if (this.model.get("includePayment") === true) {
                new Billing(nutzung, produkt, jahr, lage);
                Radio.on("Billing", "detailsCompleted", this.billingDetailsCompleted, this);
                Radio.on("Billing", "billCreated", this.nextStep, this);
            }

            new Summary(this.model.get("params"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("jahr"), this.model.get("lage"));
        },
        render: function () {
            var attr = this.model.toJSON();

            // Wenn keine Parameter benötigt werden, gibt es auch kein #parameter-Div
            if ($("#parameter").length > 0) {
                $("#parameter").after(this.$el.html(this.template(attr)));
                $("#parameter").hide();
            }
            else if ($("#bodenrichtwerte").length > 0) {
                $("#bodenrichtwerte").after(this.$el.html(this.template(attr)));
                $("#bodenrichtwerte").hide();
            }
            else {
                $("#queries").after(this.$el.html(this.template(attr)));
                $("#queries").hide();
            }
        },
        /**
         * Reagiert auf den Weiter-Button und initiiert ggf. die Rechnungserstellung oder öffnet netchecker
         * @fires orderBill#Initiiert die Rechnungserstellung
         */
        weiter: function () {
            if (this.model.get("includePayment") === true) {
                Radio.trigger("Billing", "orderBill");
            }
            else {
                this.nextStep(false);
            }
        },
        /**
         * Reagiert auf den zurück-Button.Öffnet das vorheirge Modul und schließt das aktuelle.
         */
        zurueck: function () {
            // Wenn keine Parameter benötigt wurden, gibt es auch kein #parameter-Div
            if ($("#parameter").length > 0) {
                Radio.trigger("ParameterView", "show");
            }
            else {
                Radio.trigger("BRWView", "remove");
                Radio.trigger("QueriesView", "show");
            }
            this.destroy();
        },
        show: function () {
            this.$el.show();
        },
        destroy: function () {
            Radio.trigger("BillingView", "destroy");
            Radio.trigger("SummaryView", "destroy");
            this.model.destroy();
            this.remove();
        },
        /**
         * Öffnet die nächste Seite.
         * @description Interne Funktion zum Öffnen der nächsten Seite.
         * @param {bool} val Rechnung gewünscht? Nur zur Info. Aktuell keine weitere Verwendung.
         * @listens Wird von "Billing" "billCreated" angetriggert.
         */
        nextStep: function () {
            window.location.href = Config.netcheckerURL + "?ORDERID=" + this.model.get("orderid");
        },
        refreshHints: function () {
            var hints = this.model.get("hints"),
                hintsArr = hints.split("|");

            _.each(hintsArr, function (hint) {
                $("#hints_p").append("<p class='bg-info'>" + hint + "</p></br>");
            });
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
        },
        /**
         * Togglet den Weiter-Button in Abhängigkeit valider Rechnungsdaten
         * @param {boolean} a Aussage ob Rechnungsdaten valide
         */
        billingDetailsCompleted: function (val) {
            var billingCompleted = val,
                calculationSuccessfull = this.model.wasSuccessfull();

            if (billingCompleted === true && calculationSuccessfull === true) {
                $("#seite4_weiter").prop("disabled", false);
            }
            else {
                $("#seite4_weiter").prop("disabled", true);
            }
        }
    });

    return OverviewView;
});
