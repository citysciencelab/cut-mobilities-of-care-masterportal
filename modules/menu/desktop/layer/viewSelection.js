define([
    "backbone",
    "text!modules/menu/desktop/layer/templateSelection.html",
    "text!modules/menu/desktop/layer/templateSettings.html",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/desktop/layer/templateSelection.html"),
        TemplateSettings = require("text!modules/menu/desktop/layer/templateSettings.html"),
        Radio = require("backbone.radio"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: " layer-item",
        template: _.template(Template),
        templateSettings: _.template(TemplateSettings),
        events: {
            "click .glyphicon-check": "toggleIsVisibleInMap",
            "click .glyphicon-unchecked": "toggleIsVisibleInMap",
            "click .glyphicon-info-sign": "showLayerInformation",
            "click .glyphicon-remove-circle": "removeFromSelection",
            "click .layer-info-item  .glyphicon-cog": "toggleIsSettingVisible",
            "click .arrows > .glyphicon-arrow-up": "moveModelUp",
            "click .arrows > .glyphicon-arrow-down": "moveModelDown",
            "click .glyphicon-plus-sign": "incTransparency",
            "click .glyphicon-minus-sign": "decTransparency",
            "click .glyphicon-picture": "openStyleWMS"
        },
        initialize: function () {
             this.listenTo(this.model, {
                "change:isSettingVisible": this.rerender,
                "change:transparency": this.rerender
            });
            this.render();
        },

        render: function () {
            this.$el.html("");
            var selector = $("ul#SelectedLayer"),
                attr = this.model.toJSON(),
                template = this.template(attr);

            if (this.model.getIsSettingVisible() === true) {
                template = this.templateSettings(attr);
            }
            if (this.model.getIsSelected()) {
                selector.prepend(this.$el.html(template));
            }
        },
        rerender: function () {
            this.$el.html("");
            var attr = this.model.toJSON(),
                template = this.template(attr);

            if (this.model.getIsSettingVisible() === true) {
                template = this.templateSettings(attr);
            }
            this.$el.html(template);
        },

        toggleIsSelected: function () {
            this.model.toggleIsSelected();
        },

        removeFromSelection: function () {
            this.model.setIsSettingVisible(false);
            this.model.setIsSelected(false);
            this.$el.remove();
        },

        toggleIsVisibleInMap: function () {
            this.model.toggleIsVisibleInMap();
            this.rerender();
        },

        showLayerInformation: function () {
            this.model.showLayerInformation();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        },

        toggleIsSettingVisible: function () {
            this.model.toggleIsSettingVisible();
            this.rerender();
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
        },
        openStyleWMS: function () {
            Radio.trigger("StyleWMS", "openStyleWMS", this.model);
            $(".nav li:first-child").removeClass("open");
         }
    });

    return LayerView;
});
