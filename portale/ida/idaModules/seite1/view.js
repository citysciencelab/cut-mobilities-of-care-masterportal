define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/seite1/model",
    "idaModules/seite1_lage/view",
    "idaModules/seite1_jahr/view",
    "idaModules/seite1_nutzung/view",
    "idaModules/seite1_produkt/view"
], function ($, Backbone, EventBus, Model) {
    "use strict";
    var Seite1View = Backbone.View.extend({
        el: "#seite_eins",
        model: Model,
        events: {
            "click #seite1_weiter": "weiter"
        },
        initialize: function () {
        },
        weiter: function () {
            this.model.requestBRWs();
        }
    });

    return new Seite1View;
});
