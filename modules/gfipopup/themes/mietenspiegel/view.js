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
            "change .msmerkmal": "changedMerkmal",
            "click #msreset": "reset"
        },
        reset: function() {
            this.render();
            this.focusNextMerkmal(0);
        },
        /**
         * Hier muss eine Reihenfolge abgearbeitet werden, bevor die Berechnung gestartet wird.
         */
        changedMerkmal: function(evt) {
            var id;
            if (evt) {
                $(".msmerkmal").each(function(index) {
                    if ($(this).attr('id') === evt.target.id) {
                        id = index + 1;
                    }
                });
                if (id) {
                    this.focusNextMerkmal(id);
                }
            }
        },
        /*
         * Erzeugt eine Liste mit gewählten Merkmalen
         */
        returnMerkmaleListe: function() {
            var merkmale = _.object(['Wohnlage'], [$(".mswohnlage").text()]);
            $(".msmerkmal").each(function() {
                if (this.value !== '-1') { // = bitte wählen
                    merkmale = _.extend(merkmale, _.object([$(this).attr('id')], [$(this).find("option:selected").text()]));
                }
            });
            return merkmale;
        },
        /*
         * Combobox mit Werten füllen. Initial leer.
         */
        fillMerkmaleInCombobox: function(comboboxId) {
            var merkmale = this.returnMerkmaleListe(),
                validMerkmale = this.model.returnValidMerkmale(comboboxId, merkmale);
            // Combobox erst leeren
            $(".msmerkmal").each(function() {
                if ($(this).attr('id') === comboboxId) {
                    $(this).find('option').each(function() {
                        if (this.value !== '-1') { // = bitte wählen
                            $(this).remove();
                        }
                    });
                }
            });
            // dann füllen
            _.each(validMerkmale, function(val, index) {
                document.getElementById(comboboxId).add(new Option(val, index));
            });
        },
        /*
         * Diese Combobox der Merkmale disablen und darauf folgende enablen.
         * Startet fillMerkmaleInCombobox;  //index in ComboboxArray
         */
        focusNextMerkmal: function(activateIndex) {
            var id,
                merkmale;
            $(".msmerkmal").each(function(index) {
                if (activateIndex === index) {
                    $(this).removeAttr('disabled');
                    id = $(this).attr('id');
                } else {
                    $(this).prop('disabled', true);
                }
            });
            if (id) {
                this.fillMerkmaleInCombobox(id);
            } else {
                merkmale = this.returnMerkmaleListe();
                this.model.calculateVergleichsmiete(merkmale);
            }
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (layer, response) {
            console.log(layer);
            console.log(response);
            EventBus.on("GFIPopupVisibility", this.popupRendered, this); // trigger in popup/model.js
            this.listenTo(this.model, "change:msMittelwert", this.changedMittelwert);
            this.listenTo(this.model, "change:msSpanneMin", this.changedSpanneMin);
            this.listenTo(this.model, "change:msSpanneMax", this.changedSpanneMax);
            this.listenTo(this.model, "change:msDatensaetze", this.changedDatensaetze);
            this.listenTo(this.model, "showErgebnisse", this.showErgebnisse);
            this.listenTo(this.model, "hideErgebnisse", this.hideErgebnisse);
            if (this.model.get('readyState') === true) {
                this.model.reset (layer, response);
                this.render();
            }
        },
        /*
         * Wenn GFI-Popup gerendert wurde. --> initialzize der View
         */
        popupRendered: function (resp) {
            if (resp === true) {
                this.focusNextMerkmal(0);
            }
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
        showErgebnisse: function() {
            $("#msergdiv").show();
            $("#msmetadaten").hide();
        },
        hideErgebnisse: function() {
            $("#msergdiv").hide();
            $("#msmetadaten").show();
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
