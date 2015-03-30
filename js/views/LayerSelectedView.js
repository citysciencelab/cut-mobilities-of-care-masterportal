define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/LayerSelected.html",
    "text!templates/LayerSetting.html",
    "eventbus"
], function ($, _, Backbone, LayerSelectedTemplate, LayerSettingTemplate, EventBus) {

    var LayerSelectedView = Backbone.View.extend({
        className : "list-group-item",
        tagName: "li",
        template: _.template(LayerSelectedTemplate),
        templateSetting: _.template(LayerSettingTemplate),
        templateButton: _.template("<div class='layer-button pull-right' data-toggle='tooltip' data-placement='bottom' title='Einstellungen'><span class='glyphicon glyphicon-cog rotate'></span></div>"),
        initialize: function () {
            this.$el.append(this.templateButton);
            this.listenTo(this.model, "change:visibility", this.render);
            this.listenTo(this.model, "change:selected", this.remove);
            this.listenTo(this.model, "change:transparence", this.render);
            this.listenTo(this.model, "change:settings", this.render);
            this.listenTo(this.model, "change:isInScaleRange", this.toggleStyle);
        },
        events: {
            "click .glyphicon-plus-sign": "upTransparence",
            "click .glyphicon-minus-sign": "downTransparence",
            "click .glyphicon-info-sign": "getMetadata",
            "click .glyphicon-check, .glyphicon-unchecked, .layer-name": "toggleVisibility",
            "click .glyphicon-arrow-up, .glyphicon-arrow-down": "moveLayer",
            "click .layer-button": "toggleSettings",
            "click .glyphicon-remove-circle": "toggleSelected"
        },
        render: function () {
            this.$(".layer-content").remove();
            this.$(".layer-settings").remove();
            var attr = this.model.toJSON();
            if (this.model.get("settings") === true) {
                this.$el.find(".layer-button").after(this.templateSetting(attr));
            }
            else {
                this.$el.find(".layer-button").after(this.template(attr));
            }
            return this;
        },
        moveLayer: function (evt) {
            var className = evt.currentTarget.className;
            if (className.search("down") !== -1) {
                EventBus.trigger("moveLayerDownInList", this.model);
            }
            else if (className.search("up") !== -1) {
                EventBus.trigger("moveLayerUpInList", this.model);
            }
        },
        upTransparence: function () {
            this.model.setUpTransparence(10);
        },
        downTransparence: function () {
            this.model.setDownTransparence(10);
        },
        toggleVisibility: function () {
            this.model.toggleVisibility();
        },
        toggleSelected: function () {
            this.model.toggleSelected();
        },
        getMetadata: function () {
            if (this.model.get("url").search("geodienste") !== -1) {
                window.open("http://metaver.de/trefferanzeige?docuuid=" + this.model.get("metaID"), "_blank");
            }
            else {
                window.open("http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.model.get("metaID"), "_blank");
            }
        },
        toggleSettings: function () {
            this.model.toggleSettings();
            this.$(".glyphicon-cog").toggleClass("rotate2");
            this.$(".glyphicon-cog").toggleClass("rotate");
        },
        toggleStyle: function () {
            if (this.model.get("isInScaleRange") === true) {
                this.$el.css("color", "#333333");
            }
            else {
                this.$el.css("color", "#cdcdcd");
            }
        }
    });

    return LayerSelectedView;
});
