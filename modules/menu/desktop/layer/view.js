import Template from "text-loader!./template.html";

const LayerView = Backbone.View.extend(/** @lends LayerView.prototype */{
    events: {
        "click .layer-item": "toggleIsSelected",
        "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
        "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
        "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp"
    },

    /**
     * @class LayerView
     * @extends Backbone.View
     * @memberof Menu.Desktop.Layer
     * @constructs
     * @listens Layer#changeIsSelected
     * @listens Layer#changeIsVisibleInTree
     * @listens Layer#changeIsOutOfRange
     * @listens Map#RadioTriggerMapChange
     * @listens LayerInformation#RadioTriggerLayerInformationUnhighlightLayerInformationIcon
     * @fires ModelList#RadioRequestModelListSetIsSelectedOnParent
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isSelected": this.rerender,
            "change:isVisibleInTree": this.removeIfNotVisible,
            "change:isOutOfRange": this.toggleColor
        });
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (this.model.get("supported").indexOf(mode) >= 0) {
                    this.removeDisableClass();
                }
                else if (mode === "2D") {
                    this.addDisableClass("Layer im 2D-Modus nicht verfügbar");
                }
                else {
                    this.addDisableClass("Layer im 3D-Modus nicht verfügbar");
                }
            }
        });
        this.listenTo(Radio.channel("LayerInformation"), {
            "unhighlightLayerInformationIcon": this.unhighlightLayerInformationIcon
        });

        this.render();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "layer list-group-item",
    template: _.template(Template),

    /**
     * todo
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON(),
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
        const mode = Radio.request("Map", "getMapMode");

        if (model.has("minScale") === true) {
            if (value === true) {
                this.addDisableClass("Layer wird in dieser Zoomstufe nicht angezeigt");
            }
            else if (this.model.get("supported").indexOf(mode) >= 0) {
                this.removeDisableClass();
            }
            else if (mode === "2D") {
                this.addDisableClass("Layer im 2D-Modus nicht verfügbar");
            }
            else {
                this.addDisableClass("Layer im 3D-Modus nicht verfügbar");
            }
        }
    },

    /**
     * todo
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON(),
            scale = Radio.request("MapView", "getOptions").scale;

        this.$el.html("");
        this.$el.html(this.template(attr));

        // If the the model should not be selectable make sure that is not selectable!
        if (!this.model.get("isSelected") && (this.model.get("maxScale") < scale || this.model.get("minScale") > scale)) {
            this.addDisableClass();
        }
    },

    /**
     * todo
     * @returns {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        Radio.trigger("ModelList", "setIsSelectedOnParent", this.model);
        this.rerender();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },

    /**
     * todo
     * @returns {void}
     */
    removeFromSelection: function () {
        this.model.setIsInSelection(false);
        this.$el.remove();
    },

    /**
     * todo
     * @returns {void}
     */
    showLayerInformation: function () {
        this.model.showLayerInformation();
        // Navigation wird geschlossen
        this.$("div.collapse.navbar-collapse").removeClass("in");
        this.highlightLayerInformationIcon();
    },

    /**
     * todo
     * @returns {void}
     */
    toggleIsSettingVisible: function () {
        this.model.toggleIsSettingVisible();
    },

    /**
     * todo
     * @returns {void}
     */
    moveModelDown: function () {
        this.model.moveDown();
    },

    /**
     * todo
     * @returns {void}
     */
    moveModelUp: function () {
        this.model.moveUp();
    },

    /**
     * todo
     * @returns {void}
     */
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    },

    /**
     * todo
     * @param {string} text -
     * @returns {void}
     */
    addDisableClass: function (text) {
        const statusCheckbox = this.$el.find("span.glyphicon.glyphicon-unchecked").length;

        this.$el.addClass("disabled");
        this.$el.find("*").css("cursor", "not-allowed");
        this.$el.find("*").css("pointer-events", "none");
        if (statusCheckbox === 0) {
            this.$el.find("span.pull-left").css({"pointer-events": "auto", "cursor": "pointer"});
        }
        this.$el.attr("title", text);
    },

    /**
     * todo
     * @returns {void}
     */
    removeDisableClass: function () {
        this.$el.removeClass("disabled");
        this.$el.find("*").css("pointer-events", "auto");
        this.$el.find("*").css("cursor", "pointer");
        this.$el.attr("title", "");
    },

    /**
     * Highlights the Layerinformation Icon in the layertree
     * @returns {void}
     */
    highlightLayerInformationIcon: function () {
        this.$el.find("span.glyphicon-info-sign").addClass("highlightLayerInformationIcon");
    },

    /**
     * Unhighlights the Layerinformation Icon in the layertree
     * @returns {void}
     */
    unhighlightLayerInformationIcon: function () {
        this.$el.find("span.glyphicon-info-sign").removeClass("highlightLayerInformationIcon");
    }
});

export default LayerView;
