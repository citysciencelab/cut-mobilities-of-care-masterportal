define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/desktop/layer/templateLightSetting.html",
    "text!modules/menu/desktop/layer/templateLight.html"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        SettingTemplate = require("text!modules/menu/desktop/layer/templateLightSetting.html"),
        LayerTemplate = require("text!modules/menu/desktop/layer/templateLight.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer",
        template: _.template(LayerTemplate),
        templateSetting: _.template(SettingTemplate),
        events: {
            "click .glyphicon-unchecked, .glyphicon-check, .title": "toggleIsSelected",
            "click .glyphicon-info-sign": "showLayerInformation",
            "click .selected-layer-item > div": "toggleLayerVisibility",
            "click .glyphicon-cog": "toggleIsSettingVisible",
            "click .arrows > .glyphicon-arrow-up": "moveModelUp",
            "click .arrows > .glyphicon-arrow-down": "moveModelDown",
            "click .glyphicon-plus-sign": "incTransparency",
            "click .glyphicon-minus-sign": "decTransparency",
            "change select": "setTransparency"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": this.rerender,
                "change:isSettingVisible": this.rerender,
                "change:transparency": this.rerender
            });

            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON(),
                selector = $("#" + this.model.getParentId());

            this.$el.html("");
            if (this.model.getIsSettingVisible() === true) {
                selector.prepend(this.$el.html(this.templateSetting(attr)));
            }
            else {
                selector.prepend(this.$el.html(this.template(attr)));
            }
        },
        rerender: function () {
            var attr = this.model.toJSON();

            this.$el.html("");
            if (this.model.getIsSettingVisible() === true) {
                this.$el.html(this.templateSetting(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }
        },

        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            this.rerender();
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

        setTransparency: function (evt) {
            this.model.setTransparency(parseInt(evt.target.value, 10));
        },

        moveModelDown: function () {
            this.model.moveDown();
        },

        moveModelUp: function () {
            this.model.moveUp();
        },
        incTransparency: function () {
            this.model.incTransparency(10);
        },
        decTransparency: function () {
            this.model.decTransparency(10);
        }
    });

    return LayerView;
});
