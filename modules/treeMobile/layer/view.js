define([
    "backbone",
    "text!modules/treeMobile/layer/template.html",
    "text!modules/treeMobile/layer/templateSelected.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/treeMobile/layer/template.html"),
        SelectedLayerTemplate = require("text!modules/treeMobile/layer/templateSelected.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(LayerTemplate),
        templateSelected: _.template(SelectedLayerTemplate),
        events: {
            "click .layer-item": "toggleIsChecked",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
            "click .selected-layer-item > .glyphicon-remove": "removeFromSelection",
            "click .selected-layer-item > div": "toggleLayerVisibility"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isChecked change:isLayerVisible": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.getIsInSelection() === true) {
                this.$el.html(this.templateSelected(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }
            return this;
        },
        toggleIsChecked: function () {
            this.model.toggleIsChecked();
        },
        removeFromSelection: function () {
            this.model.setIsInSelection(false);
            this.model.setIsChecked(false);
            this.$el.remove();
        },
        toggleLayerVisibility: function () {
            this.model.toggleLayerVisibility();
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        }
    });

    return LayerView;
});
