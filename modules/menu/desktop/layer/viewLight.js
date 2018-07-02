define([
    "backbone",
    "text!modules/menu/desktop/layer/templateSettings.html",
    "text!modules/menu/desktop/layer/templateLight.html",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        TemplateSettings = require("text!modules/menu/desktop/layer/templateSettings.html"),
        Template = require("text!modules/menu/desktop/layer/templateLight.html"),
        Radio = require("backbone.radio"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer list-group-item",
        template: _.template(Template),
        templateSettings: _.template(TemplateSettings),
        events: {
            "click .glyphicon-unchecked, .glyphicon-check, .title": "toggleIsSelected",
            "click .glyphicon-info-sign": "showLayerInformation",
            "click .glyphicon-cog": "toggleIsSettingVisible",
            "click .arrows > .glyphicon-arrow-up": "moveModelUp",
            "click .arrows > .glyphicon-arrow-down": "moveModelDown",
            "click .glyphicon-plus-sign": "incTransparency",
            "click .glyphicon-minus-sign": "decTransparency",
            "change select": "setTransparency",
            "click .glyphicon-picture": "openStyleWMS"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": this.rerender,
                "change:isSettingVisible": this.renderSetting,
                "change:transparency": this.rerender,
                "change:isOutOfRange": this.toggleColor
            });

            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
            this.render();

            this.toggleColor(this.model, this.model.getIsOutOfRange());
        },

        render: function () {
            var attr = this.model.toJSON(),
                selector = $("#" + this.model.getParentId());

            selector.prepend(this.$el.html(this.template(attr)));
            if (this.model.getIsSettingVisible() === true) {
                this.$el.append(this.templateSettings(attr));
            }
        },

        rerender: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            if (this.model.getIsSettingVisible() === true) {
                this.$el.append(this.templateSettings(attr));
            }
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
                this.$el.find(".layer-settings").slideUp("slow", function () {
                    $(this).remove();
                });
            }
            else {
                this.$el.append(this.templateSettings(attr));
                this.$el.find(".layer-settings").hide();
                this.$el.find(".layer-settings").slideDown();
            }
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            this.rerender();
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
        },
        openStyleWMS: function () {
            Radio.trigger("StyleWMS", "openStyleWMS", this.model);
            $(".nav li:first-child").removeClass("open");
        },

        /**
         * Wenn der Layer außerhalb seines Maßstabsberreich ist, wenn die view ausgegraut und nicht anklickbar
         */
        toggleColor: function (model, value) {
            if (model.has("minScale") === true) {
                if (value === true) {
                    this.$el.addClass("disabled");
                    this.$el.find("*").css("pointer-events", "none");
                    this.$el.find("*").css("cursor", "not-allowed");
                    this.$el.attr("title", "Layer wird in dieser Zoomstufe nicht angezeigt");
                }
                else {
                    this.$el.removeClass("disabled");
                    this.$el.find("*").css("pointer-events", "auto");
                    this.$el.find("*").css("cursor", "pointer");
                    this.$el.attr("title", "");
                }
            }
        }
    });

    return LayerView;
});
