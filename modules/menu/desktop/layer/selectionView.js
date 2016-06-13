define([
    "backbone",
    "text!modules/menu/desktop/layer/templateSelected.html",
    "text!modules/menu/desktop/layer/templateSetting.html"
], function () {

    var Backbone = require("backbone"),
        SelectedLayerTemplate = require("text!modules/menu/desktop/layer/templateSelected.html"),
        SettingTemplate = require("text!modules/menu/desktop/layer/templateSetting.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: " layer-item",
        //template: _.template(LayerTemplate),
        template: _.template(SelectedLayerTemplate),
        templateSetting: _.template(SettingTemplate),
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
            this.render();
        },

        render: function () {
            this.$el.html("");
            var selector = $("ul#SelectedLayer"),
                attr = this.model.toJSON(),
                template = this.template(attr);

            if (this.model.getIsSettingVisible() === true) {
                this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
                template = this.templateSetting(attr);
            }
            if (this.model.getIsSelected()) {
                selector.prepend(this.$el.html(template));
            }
        },

        /*
         * Zeichnet die Einstellungen (Transparenz, Metainfos, ...)
         */
        /*renderSetting: function () {
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

        },*/

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
            this.render();
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
