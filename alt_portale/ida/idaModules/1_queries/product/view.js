define([
    "jquery",
    "backbone",
    "idaModules/1_queries/product/model",
    "idaModules/wps/model"
], function ($, Backbone, Model, WPS) {
    "use strict";
    var ProductView = Backbone.View.extend({
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

    return new ProductView;
});
