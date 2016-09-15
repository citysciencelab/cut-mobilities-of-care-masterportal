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
        initialize: function () {
            this.listenTo(this.model, "change:brwList", this.render);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        /*
        * Wird zweimal gerufen, wenn mit Strg + V eingefügt wird. Einmal pro Taste.
        */
        checkBRWNummer: function (evt) {
            if (evt.ctrlKey === false && evt.shiftKey === false && evt.altKey === false) { // verhindert doppeltes ausführen
                if (evt.currentTarget.value.length === 7) { // return
                    var wnum = "0" + evt.currentTarget.value,
                        nutzung = evt.currentTarget.id.split("#")[0],
                        jahr = evt.currentTarget.id.split("#")[1];

                    this.model.requestBRWDetails(wnum, jahr, nutzung);
                }
                else if (evt.keyCode === 13 || evt.currentTarget.value.length === 8) {
                    var wnum = evt.currentTarget.value,
                        nutzung = evt.currentTarget.id.split("#")[0],
                        jahr = evt.currentTarget.id.split("#")[1];

                    this.model.requestBRWDetails(wnum, jahr, nutzung);
                }
            }
        }
    });

    return new ManuallyView();
});
