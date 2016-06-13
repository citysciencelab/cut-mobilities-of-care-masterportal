define([
    "backbone",
    "text!modules/menu/desktop/layer/template.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/menu/desktop/layer/template.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer",
        template: _.template(LayerTemplate),
        events: {
            "click .layer-item": "toggleIsSelected",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
            "click .selected-layer-item > .glyphicon-remove": "removeFromSelection",
            "click .selected-layer-item > div": "toggleLayerVisibility",
            "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
            "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
            "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
            "change select": "setTransparence"
        },
        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html("");
            var attr = this.model.toJSON(),
                template = this.template(attr),
                selector = $("#" + this.model.getParentId());

            if (this.model.getIsVisibleInTree()) {

                if (this.model.getLevel() === 0) {
                    selector.append(this.$el.html(template));
                }
                else {
                    selector.after(this.$el.html(template));
                }
                $(this.$el).css("padding-left", (this.model.getLevel() + 1) * 10 + "px");
            }
        },

        toggleIsSelected: function () {
            this.model.toggleIsSelected();
        },

        removeFromSelection: function () {
            this.model.setIsInSelection(false);
            this.model.setIsSettingVisible(false);
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
        },

        toggleIsSettingVisible: function () {
            this.model.toggleIsSettingVisible();
        },

        setTransparence: function (evt) {
            this.model.setTransparence(parseInt(evt.target.value, 10));
        },

        moveModelDown: function () {
            this.model.moveDown();
        },

        moveModelUp: function () {
            this.model.moveUp();
        }
    });

    return LayerView;
});
