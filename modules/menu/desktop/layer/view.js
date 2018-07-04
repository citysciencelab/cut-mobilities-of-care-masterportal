define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/desktop/layer/template.html"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/menu/desktop/layer/template.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer list-group-item",
        template: _.template(Template),
        events: {
            "click .layer-item": "toggleIsSelected",
            "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
            "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
            "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": this.rerender,
                "change:isVisibleInTree": this.removeIfNotVisible,
                "change:isOutOfRange": this.toggleColor
            });
            this.render();
            this.toggleColor(this.model, this.model.getIsOutOfRange());
        },

        render: function () {
            var attr = this.model.toJSON(),
                selector = $("#" + this.model.getParentId());

            this.$el.html("");
            if (this.model.getIsVisibleInTree()) {
                if (this.model.getLevel() === 0) {
                    selector.prepend(this.$el.html(this.template(attr)));
                }
                else {
                    selector.after(this.$el.html(this.template(attr)));
                }
                $(this.$el).css("padding-left", (this.model.getLevel() * 15 + 5) + "px");
            }
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
        },

        rerender: function () {
            var attr = this.model.toJSON();

            this.$el.html("");
            this.$el.html(this.template(attr));
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            Radio.trigger("ModelList", "setIsSelectedOnParent", this.model);
            this.rerender();
        },
        removeFromSelection: function () {
            this.model.setIsInSelection(false);
            this.$el.remove();
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        },
        toggleIsSettingVisible: function () {
            this.model.toggleIsSettingVisible();
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
        }
    });

    return LayerView;
});
