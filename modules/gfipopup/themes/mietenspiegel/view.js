define([
    "backbone",
    "text!modules/gfipopup/themes/mietenspiegel/template.html",
    "modules/gfipopup/themes/mietenspiegel/model",
    "eventbus"
], function (Backbone, GFITemplate, GFIModel, EventBus) {
    "use strict";
    var GFIContentMietenspiegelView = Backbone.View.extend({
        /*
         + Die Mietenspiegel-View öffnet sich auf jede GFI-Abfrage. Sein Model hingegen bleibt konstant.
         */
        model: GFIModel,
        template: _.template(GFITemplate),
        events: {
            "remove": "destroy",
            "change .msmerkmal": "changedMerkmal"
        },
        /**
         * Übergibt alle select
         * Hier muss eine Reihenfolge abgearbeitet werden, bevor die Berechnung gestartet wird.
         * Die Angaben unter Wohnfläche sind verwirrend.
         */
        changedMerkmal: function(evt) {
            if (evt) {
//                $(evt.target.parentElement).append('<p class="text-right mswohnlage">Normale Wohnlage</p>');
                var merkmale = [];
                merkmale.push({
                    name: 'Wohnlage',
                    value: $(".mswohnlage").text()
                });
                $(".msmerkmal").each(function() {
                    merkmale.push({
                        name: $(this).attr('id'),
                        value: $(this).val()
                    });
                });
//                $(evt.target).remove();
                this.model.calculateVergleichsmiete(merkmale);
            }
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (layer, response) {
            EventBus.on("GFIPopupVisibility", this.popupRendered, this); // trigger in popup/model.js
            this.listenTo(this.model, "change:msMittelwert", this.changedMittelwert);
            this.listenTo(this.model, "change:msSpanneMin", this.changedSpanneMin);
            this.listenTo(this.model, "change:msSpanneMax", this.changedSpanneMax);
            this.listenTo(this.model, "change:msDatensaetze", this.changedDatensaetze);
            if (this.model.get('readyState') === true) {
                this.model.reset (layer, response);
                this.render();
            }
        },
        /*
         * initiale Berechnung der Werte
         */
        popupRendered: function (resp) {
            if (resp === true) this.changedMerkmal();
        },
        changedMittelwert: function() {
            $(".msmittelwert").text(this.model.get('msMittelwert').toString());
        },
        changedSpanneMin: function() {
            $(".msspannemin").text(this.model.get('msSpanneMin').toString());
        },
        changedSpanneMax: function() {
            $(".msspannemax").text(this.model.get('msSpanneMax').toString());
        },
        changedDatensaetze: function() {
            $(".msdatensaetze").text(this.model.get('msDatensaetze').toString());
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        /**
         *
         */
        destroy: function () {
        },
    });

    return GFIContentMietenspiegelView;
});
