define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Model = require("idaModules/4_overview/billing/model"),
        Template = require("text!idaModules/4_overview/billing/template.html"),
        BillingView;

    BillingView = Backbone.View.extend({
        id: "billing",
        model: new Model(),
        template: _.template(Template),
        events: {
            "click #toggleBill": "toggleBill",
            "keyup input[type=text]": "keyup"
        },
        initialize: function (nutzung, produkt, jahr, lage) {
            var channel = Radio.channel("BillingView");

            channel.on({
                "destroy": this.destroy
            }, this);
            this.model.setNutzung(nutzung);
            this.model.setProdukt(produkt);
            this.model.setJahr(jahr);
            this.model.setLage(lage);

            this.listenTo(this.model, {
                "change:errors": this.setErrorMessages
            });

            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#result").after(this.$el.html(this.template(attr)));
        },
        destroy: function () {
            this.remove();
        },
        /**
         * Sorgt für die Darstellung der Fehler in der View
         * @param {object} val    this-Objekt
         * @param {object} errors Fehler-Objekt
         */
        setErrorMessages: function (val, errors) {
            var inputs = $("#billDetails").find(".input-group");

            _.each(inputs, function (input) {
                $(input).removeClass("has-error");
                $(input).find(".label").remove();
            });
            _.each(errors, function (errText, errAttribute) {
                $("#" + errAttribute).parent().addClass("has-error");
                $("#" + errAttribute).parent().append("<span class='label label-danger'>" + errText + "</span>");
            });
        },
        /**
         * Klappt die Rechnungsdaten auf oder zu
         */
        toggleBill: function () {
            $("#billDetails").toggle("slow");
            $("#summaryDetails").toggle("slow");
        },
        /**
         * Speichert die eingegebenen Rechnungsdaten im Model
         * @param {object} evt Event-Objekt des input
         */
        keyup: function (evt) {
            if (evt.target.id) {
                this.model.keyup(evt.target.id, evt.target.value);
            }
        }
    });

    return BillingView;
});
