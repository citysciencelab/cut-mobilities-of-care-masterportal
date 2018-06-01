define([
    "backbone",
    "text!modules/menu/table/layer/templates/templateSingleLayer.html",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/table/layer/templates/templateSingleLayer.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "burgermenu-layer-list list-group-item",
        template: _.template(Template),
        events: {
            "click .icon-checkbox, .icon-checkbox2, .title": "toggleIsSelected",
            "click .icon-info": "showLayerInformation"
        },
        initialize: function () {
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this.$el;
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            this.render();
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
        }
    });

    return LayerView;
});
