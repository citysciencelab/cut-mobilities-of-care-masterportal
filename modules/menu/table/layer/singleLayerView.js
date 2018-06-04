define([
    "backbone",
    "text!modules/menu/table/layer/templates/templateSettings.html",
    "text!modules/menu/table/layer/templates/templateSingleLayer.html",
    "jquery"
], function (Backbone, TemplateSettings, Template, $) {

    var LayerView = Backbone.View.extend({
        tagName: "li",
        className: "burgermenu-layer-list list-group-item",
        template: _.template(Template),
        templateSettings: _.template(TemplateSettings),
        events: {
            "click .icon-checkbox, .icon-checkbox2, .title": "toggleIsSelected",
            "click .icon-info": "showLayerInformation",
            "click .glyphicon-cog": "toggleIsSettingVisible",
            "click .arrows > .glyphicon-arrow-up": "moveModelUp",
            "click .arrows > .glyphicon-arrow-down": "moveModelDown",
            "click .glyphicon-plus-sign": "incTransparency",
            "click .glyphicon-minus-sign": "decTransparency",
            "change select": "setTransparency"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSettingVisible": this.renderSetting,
                "change:transparency": this.render
            });
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            if (this.model.getIsSettingVisible() === true) {
                this.$el.append(this.templateSettings(attr));
            }
            return this.$el;
        },
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
            this.render();
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
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
