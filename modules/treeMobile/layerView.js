define([
    "backbone",
    "text!modules/treeMobile/templateLayer.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/treeMobile/templateLayer.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(LayerTemplate),
        events: {
            "click .layer-item": "toggleIsChecked"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isChecked": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },
        toggleIsChecked: function () {
            this.model.toggleIsChecked();
        }
    });

    return LayerView;
});
