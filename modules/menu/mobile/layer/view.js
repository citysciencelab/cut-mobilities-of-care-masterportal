define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/mobile/layer/template.html",
    "text!modules/menu/mobile/layer/templateSelected.html",
    "text!modules/menu/mobile/layer/templateSetting.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/menu/mobile/layer/template.html"),
        SelectedLayerTemplate = require("text!modules/menu/mobile/layer/templateSelected.html"),
        SettingTemplate = require("text!modules/menu/mobile/layer/templateSetting.html"),
        Radio = require("backbone.radio"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(LayerTemplate),
        templateSelected: _.template(SelectedLayerTemplate),
        templateSetting: _.template(SettingTemplate),
        events: {
            "click .layer-item": "toggleIsSelected",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
            "click .selected-layer-item > .glyphicon-remove": "removeFromSelection",
            "click .selected-layer-item > div": "toggleIsVisibleInMap",
            "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
            "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
            "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
            "change select": "setTransparence"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isSelected change:isVisibleInMap": this.render,
                 "change:isSettingVisible": this.renderSetting
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            if (Radio.request("BreadCrumb", "getLastItem").getId() === "SelectedLayer") {
                this.$el.html(this.templateSelected(attr));
                if (this.model.getIsSettingVisible() === true) {
                    this.renderSetting();
                }
            }
            else {
                this.$el.html(this.template(attr));
                if (this.model.has("treeType")) {
                    this.renderSetting();
                }
            }

            return this;
        },

        /**
         * Zeichnet die Einstellungen (Transparenz, Metainfos, ...)
         */
        renderSetting: function () {
            var attr = this.model.toJSON();

            // Animation Zahnrad
            this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
            // Slide-Animation templateSetting
            if (this.model.getIsSettingVisible() === false) {
                this.$el.find(".item-settings").slideUp("slow", function () {
                    this.remove();
                });
            }
            else {
                this.$el.append(this.templateSetting(attr));
                this.$el.find(".item-settings").hide();
                this.$el.find(".item-settings").slideDown();
            }

        },

        toggleIsSelected: function () {
            this.model.toggleIsSelected();
        },

        removeFromSelection: function () {
            this.model.setIsInSelection(false);
            this.model.setIsSettingVisible(false);
            this.model.setIsSelected(false);
            this.$el.remove();
        },

        toggleIsVisibleInMap: function () {
            this.model.toggleIsVisibleInMap();
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
