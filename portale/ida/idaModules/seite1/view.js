define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/seite1/model",
    "idaModules/seite1_lage/view"
], function ($, Backbone, EventBus, Model, Seite1_Lage) {
    /*
     *
     */
    var Seite1View = Backbone.View.extend({
        el: "#seite_eins",
        model: Model,
        events: {
        },
        initialize: function () {
        }
    });

    return new Seite1View;
});
