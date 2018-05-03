define([
    "backbone",
    "text!modules/menu/table/layer/templateLayerItem.html"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/table/layer/templateLayerItem.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer list-group-item",
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
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON(),
                selector = $("#" + this.model.getParentId() + "-table");

            selector.prepend(this.$el.html(this.template(attr)));
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            this.rerender();
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        }
    });
    return LayerView;
});
