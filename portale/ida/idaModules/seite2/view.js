define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/seite2/model",
    "idaModules/seite2_brwmanuell/view",
    "idaModules/seite3/view"
], function ($, Backbone, EventBus, Model, BRWManuellView, Seite3) {
    "use strict";
    var Seite2View = Backbone.View.extend({
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

    return Seite2View;
});
