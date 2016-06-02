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
        //templateSelected: _.template(SelectedLayerTemplate),
        //templateSetting: _.template(SettingTemplate),
        events: {
            "click .layer-item": "toggleIsChecked",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
            "click .selected-layer-item > .glyphicon-remove": "removeFromSelection",
            "click .selected-layer-item > div": "toggleLayerVisibility",
            "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
            "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
            "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
            "change select": "setTransparence"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 //"change:isChecked change:isLayerVisible": this.render,
                 "change:isSettingVisible": this.renderSetting
            });
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();


            /*    this.$el.html(this.templateSelected(attr));
                if (this.model.getIsSettingVisible() === true) {
                    this.renderSetting();
                }
                this.$el.html(this.template(attr));
                if (this.model.has("treeType")) {
                    this.renderSetting();
                }*/

            if (this.model.isVisibleInTree) {
                var selector = "";

                if (this.model.getLevel() === 0) {
                    $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));
                }
                else {
                    $("#" + this.model.getParentId()).after(this.$el.html(this.template(attr)));
                }
                $(this.$el).css("padding-left", this.model.getLevel() * 10 + "px");
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

        toggleIsChecked: function () {
            this.model.toggleIsChecked();
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
