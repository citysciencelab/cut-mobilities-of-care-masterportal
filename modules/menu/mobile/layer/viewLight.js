define([
    "backbone",
    "text!modules/menu/mobile/layer/templateLight.html",
    "backbone.radio",
    "text!modules/menu/mobile/layer/templateSettings.html"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/mobile/layer/templateLight.html"),
        SettingTemplate = require("text!modules/menu/mobile/layer/templateSettings.html"),
        Radio = require("backbone.radio"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(Template),
        templateSetting: _.template(SettingTemplate),
        events: {
            "click .layer-item": "toggleIsSelected",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
            "click .selected-layer-item > div": "toggleIsVisibleInMap",
            "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
            "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
            "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
            "change select": "setTransparency",
            "click .glyphicon-picture": "openStyleWMS"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isSelected change:isVisibleInMap": this.render,
                 "change:isSettingVisible": this.renderSetting,
                 "change:isVisibleInTree": this.removeIfNotVisible,
                "change:isOutOfRange": this.toggleColor
            });
            if(this.model.attributes.supported) {
                this.listenTo(Radio.channel("Map"), {
                    "change": function (mode) {
                        this.toggleSupportedVisibility(mode);
                    }
                });
            }
            this.toggleSupportedVisibility(Radio.request("Map", "getMapMode"));

            this.toggleColor(this.model, this.model.getIsOutOfRange());
        },

        /**
         * Wenn der Layer außerhalb seines Maßstabsberreich ist, wenn die view ausgegraut und nicht anklickbar
         */
        toggleColor: function (model, value) {
            if (model.has("minScale") === true) {
                if (value === true) {
                    this.$el.addClass("disabled");
                    this.$el.find("*").css("pointer-events","none");
                }
                else {
                    this.$el.removeClass("disabled");
                    this.$el.find("*").css("pointer-events","auto");
                }
            }
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            if (this.model.getIsSettingVisible() === true) {
                this.renderSetting();
            }

            return this;
        },
        toggleSupportedVisibility: function(mode) {

            if(this.model.attributes.supported.indexOf(mode) >= 0) {
                this.$el.show();
            }else{
                this.$el.hide();
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

        setTransparency: function (evt) {
            this.model.setTransparency(parseInt(evt.target.value, 10));
        },

        moveModelDown: function () {
            this.model.moveDown();
        },

        moveModelUp: function () {
            this.model.moveUp();
        },
        removeIfNotVisible: function () {
            if (!this.model.getIsVisibleInTree()) {
                this.remove();
            }
        },
        openStyleWMS: function () {
            Radio.trigger("StyleWMS", "openStyleWMS", this.model);
            $(".navbar-collapse").removeClass("in");
        }
    });

    return LayerView;
});
