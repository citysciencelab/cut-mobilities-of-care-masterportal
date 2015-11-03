define([
    "jquery",
    "backbone",
    "idaModules/seite1_produkt/model",
    "idaModules/wps/model"
], function ($, Backbone, Model, WPS) {
    "use strict";
    var Seite1NutzungView = Backbone.View.extend({
        el: "#produkt",
        model: Model,
        events: {
            "change #produktdropdown": "checkProdukt"
        },
        initialize: function () {
        },
        checkProdukt: function (evt) {
            this.model.setProdukt(evt.target.value);
        }
    });

    return new Seite1NutzungView;
});
