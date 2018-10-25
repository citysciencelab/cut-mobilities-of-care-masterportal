import Template from "text-loader!./template.html";

const LayerView = Backbone.View.extend({
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
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "layer list-group-item",
    template: _.template(Template),

    render: function () {
        var attr = this.model.toJSON(),
            selector = $("#" + this.model.get("parentId"));

        this.$el.html("");
        if (this.model.get("isVisibleInTree")) {
            if (this.model.get("level") === 0) {
                selector.prepend(this.$el.html(this.template(attr)));
            }
            else {
                selector.after(this.$el.html(this.template(attr)));
            }
            this.$el.css("padding-left", ((this.model.get("level") * 15) + 5) + "px");
        }
        return this;
    },
    /**
     * Wenn der Layer außerhalb seines Maßstabsberreich ist, wenn die view ausgegraut und nicht anklickbar
     * @param {Backbone.Model} model -
     * @param {boolean} value -
     * @returns {void}
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
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    }
});

export default LayerView;
