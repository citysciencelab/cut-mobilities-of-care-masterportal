define([
    "backbone",
    "text!modules/treeMobile/layer/template.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/treeMobile/layer/template.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(LayerTemplate),
        events: {
            "click .layer-item": "toggleIsChecked",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation"
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
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        }
    });

    return LayerView;
});
