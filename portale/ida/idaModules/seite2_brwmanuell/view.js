define([
    "jquery",
    "backbone",
    "idaModules/seite2_brwmanuell/model",
    "text!idaModules/seite2_brwmanuell/template.html"
], function ($, Backbone, Model, Template) {
    "use strict";
    var Seite2BRWView = Backbone.View.extend({
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
        checkBRWNummer: function (evt) {
            if (evt.keyCode === 13 || evt.currentTarget.value.length === 8) { // return
                var wnum = evt.currentTarget.value,
                    nutzung = evt.currentTarget.id.split("_")[0],
                    jahr = evt.currentTarget.id.split("_")[1];

                this.model.requestBRWDetails(wnum, jahr);
            }
        }
    });

    return new Seite2BRWView();
});
