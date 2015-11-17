define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/seite2/model",
    "idaModules/seite2_brwmanuell/view"
], function ($, Backbone, EventBus, Model, BRWManuellView) {
    "use strict";
    var Seite2View = Backbone.View.extend({
        el: "#seite_zwei",
        model: Model,
        events: {
            "click #seite2_weiter": "weiter"
        },
        initialize: function (jahr, nutzung, produkt, lage) {
            this.model.set("jahr", jahr);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("lage", lage);
            this.model.requestBRWs();
            this.show();
        },
        weiter: function () {
            // Button fehlt noch
        },
        show: function () {
            $("#seite_zwei").show();
            $("#seite_eins").hide();
            $("#seite_drei").hide();
        }
    });

    return Seite2View;
});
