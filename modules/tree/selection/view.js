define([
    "backbone",
    "text!modules/tree/selection/template.html",
    "text!modules/tree/selection/templateSettings.html"
], function (Backbone, Template, SettingTemplate) {

    var view = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(Template),
        templateSetting: _.template(SettingTemplate),
        templateButton: _.template("<div class='layer-toggle-button pull-right' data-toggle='tooltip' data-placement='bottom' title='Einstellungen'><span class='glyphicon glyphicon-cog rotate'></span></div>"),
        events: {
            "click .glyphicon-plus-sign": "upTransparence",
            "click .glyphicon-minus-sign": "downTransparence",
            "click .glyphicon-info-sign": "openMetadata",
            "click .glyphicon-check, .glyphicon-unchecked, div.layer-name": "toggleVisibility",
            "click .glyphicon-arrow-up": "moveModelUp",
            "click .glyphicon-arrow-down": "moveModelDown",
            "click .layer-toggle-button": "toggleSettings",
            "click .glyphicon-remove-circle": "toggleSelected",
            "movemodel": "moveModelDelta"
        },
        initialize: function () {
            this.$el.append(this.templateButton);
            this.listenTo(this.model, "change:visibility change:transparence change:settings", this.render);
            this.listenTo(this.model, "change:selected", this.remove);
            this.listenTo(this.model, "change:viewResolution", this.toggleStyle);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$(".layer-selected").remove();
            this.$(".layer-settings").remove();
            if (this.model.get("settings") === true) {
                this.$(".layer-toggle-button").after(this.templateSetting(attr));
            }
            else {
                this.$(".layer-toggle-button").after(this.template(attr));
            }
            this.toggleStyle();
            return this;
        },
        moveModelUp: function () {
            this.model.moveUp();
        },
        moveModelDown: function () {
            this.model.moveDown();
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
        openMetadata: function () {
            this.model.openMetadata();
        },
        toggleSettings: function () {
            this.model.toggleSettings();
            this.$(".glyphicon-cog").toggleClass("rotate-back");
            this.$(".glyphicon-cog").toggleClass("rotate");
        },
        toggleStyle: function () {
            if (this.model.get("isResolutionInRange") === true) {
                this.$el.css("color", "rgb(150, 150, 150)");
            }
            else {
                this.$el.css("color", "rgba(150, 150, 150, 0.6)");
            }
        },
        moveModelDelta: function (evt, index) {
            this.model.collection.moveModelDelta(this.model, index);
        }
    });

    return view;
});
