define([
    "jquery",
    "backbone",
    "text!idaModules/1_queries/product/template.html",
    "idaModules/1_queries/product/model",
    "idaModules/wps/model"
], function ($, Backbone, Template, Model, WPS) {
    "use strict";
    var ProductView = Backbone.View.extend({
        el: "#produkt",
        className: "panel panel-default",
        template: _.template(Template),
        model: Model,
        events: {
            "change #produktdropdown": "checkProdukt"
        },
        initialize: function () {
            this.render();
        },
        checkProdukt: function (evt) {
            this.model.setProdukt(evt.target.value);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return ProductView;
});
