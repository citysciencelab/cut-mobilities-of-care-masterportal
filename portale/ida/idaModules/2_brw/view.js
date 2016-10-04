define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/2_brw/model",
    "idaModules/2_brw/manually/view",
    "idaModules/3_parameter/view",
    "text!idaModules/2_brw/template.html"
], function ($, Backbone, EventBus, Model, BRWManuellView, Seite3, Template) {
    "use strict";
    var BRWView = Backbone.View.extend({
//        el: "#seite_zwei",
        id: "seite_zwei",
        template: _.template(Template),
        model: Model,
        events: {
            "click #seite2_weiter": "weiter"
        },
        initialize: function (jahr, nutzung, produkt, lage) {
            this.listenTo(this.model, "change:complete", this.weiter);

            this.model.set("jahr", jahr);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("lage", lage);
            this.show();
            new BRWManuellView();
            this.model.requestNecessaryData();
        },
        weiter: function () {
            new Seite3(this.model.get("lage"), this.model.get("params"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("brwList"), this.model.get("jahr"));
        },
        show: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("#seite_eins").after(this.$el.html(this.template(attr)));
            $("#seite_eins").hide();
            $("#seite_drei").hide();
        }
    });

    return BRWView;
});
