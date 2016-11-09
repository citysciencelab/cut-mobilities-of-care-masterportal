define([
    "jquery",
    "backbone",
    "idaModules/2_brw/manually/model",
    "text!idaModules/2_brw/manually/template.html"
], function ($, Backbone, Model, Template) {
    "use strict";
    var ManuallyView = Backbone.View.extend({
        el: "#brwliste",
        model: Model,
        template: _.template(Template),
        events: {
            "keyup input[type=text]": "checkBRWNummer"
        },
        initialize: function (jahr, nutzung, produkt) {
            this.listenTo(this.model, "change:brwList", this.render);

            this.model.set("jahr", jahr);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        /*
        * Wird zweimal gerufen, wenn mit Strg + V eingefügt wird. Einmal pro Taste.
        */
        checkBRWNummer: function (evt) {
            if (evt.keyCode >= 48 && evt.keyCode <= 57 || evt.keyCode >= 96 && evt.keyCode <= 105) { // nur Zahlen
                this.requestBRW(evt);
            }
            else if (evt.keyCode === 86) { // könnte Strg + V sein
                this.requestBRW(evt);
            }
        },
        requestBRW: function (evt) {
            if (evt.currentTarget.value.length === 7) {
                var wnum = "0" + evt.currentTarget.value;
            }
            else if (evt.currentTarget.value.length === 8) {
                var wnum = evt.currentTarget.value;
            }
            else {
                return;
            }
            var nutzung = evt.currentTarget.id.split("#")[0],
                jahr = evt.currentTarget.id.split("#")[1];

            this.model.requestBRWDetails(wnum, jahr, nutzung);
        }
    });

    return ManuallyView;
});
