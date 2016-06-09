define([
    "backbone",
    "text!modules/menu/desktop/layer/template.html",
    "text!modules/menu/desktop/layer/templateSelected.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/menu/desktop/layer/template.html"),
        SelectedLayerTemplate = require("text!modules/menu/desktop/layer/templateSelected.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer",
        //template: _.template(LayerTemplate),
        template: _.template(SelectedLayerTemplate),
        //templateSetting: _.template(SettingTemplate),
        events: {
            "click .glyphicon-check": "toggleIsVisibleInMap",
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
            if (this.model.getIsSelected()) {
                var selector = $("#SelectedLayer");

                selector.prepend(this.$el.html(this.template(attr)));
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

        removeFromSelection: function () {
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
