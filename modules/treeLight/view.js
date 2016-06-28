define([
    "backbone",
    "text!modules/treeLight/template.html",
    "text!modules/treeLight/templateSettings.html",
    "eventbus"
], function (Backbone, LayerTemplate, SettingsTemplate, EventBus) {

    var LayerView = Backbone.View.extend({
        className: "list-group-item tree-light-list",
        tagName: "li",
        template: _.template(LayerTemplate),
        templateSettings: _.template(SettingsTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:visibility change:transparence change:settings": this.render
            });
            this.listenTo(this.model, "change:isInScaleRange", this.toggleStyle);
        },
        events: {
            "click .plus": "upTransparence",
            "click .minus": "downTransparence",
            "click .info": "getMetadata",
            "click .check, .unchecked, .layer > div > .name": "toggleVisibility",
            "click .up": "moveModelUp",
            "click .down": "moveModelDown",
            "click .refresh": "toggleSettings",
            "click .picture": "openStyleWMS"
        },

        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("settings") === true) {
                this.$el.html(this.templateSettings(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }
            if (this.model.get("displayInTree") !== false) {
                this.$el.css("display", "block");
            }
            else {
                this.$el.css("display", "none");
            }
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
        getMetadata: function () {
            this.model.openMetadata();
        },
        toggleSettings: function () {
            this.model.toggleSettings();
        },
        toggleStyle: function () {
            if (this.model.get("isInScaleRange") === true) {
                this.$el.css("color", "rgb(153, 153, 153)");
            }
            else {
                this.$el.css("color", "rgba(153, 153, 153, 0.6)");
            }
        },
        openStyleWMS: function () {
            EventBus.trigger("toggleWin", ["styleWMS", "Style WMS", "glyphicon-picture", this.model.getId()]);
            $(".nav li:first-child").removeClass("open");
        }
    });

    return LayerView;
});
