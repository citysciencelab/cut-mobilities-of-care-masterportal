define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/2_brw/model",
    "idaModules/2_brw/manually/view",
    "idaModules/3_parameter/view"
], function ($, Backbone, EventBus, Model, BRWManuellView, Seite3) {
    "use strict";
    var BRWView = Backbone.View.extend({
        el: "#seite_zwei",
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
            this.model.requestNecessaryData();
            this.show();
        },
        weiter: function () {
            new Seite3(this.model.get("lage"), this.model.get("params"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("brwList"), this.model.get("jahr"));
        },
        show: function () {
            $("#seite_zwei").show();
            $("#seite_eins").hide();
            $("#seite_drei").hide();
        }
    });

    return BRWView;
});
