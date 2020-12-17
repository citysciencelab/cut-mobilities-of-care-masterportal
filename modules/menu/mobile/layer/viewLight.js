import Template from "text-loader!./templateLight.html";
import SettingTemplate from "text-loader!./templateSettings.html";
import checkChildrenDatasets from "../../checkChildrenDatasets.js";

const LayerView = Backbone.View.extend(/** @lends LayerView.prototype */{
    events: {
        "click .layer-item": "toggleIsSelected",
        "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
        "click .selected-layer-item > div": "toggleIsVisibleInMap",
        "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
        "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
        "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
        "change select": "setTransparency",
        "click .glyphicon-tint": "openStyleWMS",
        "click .remove-layer": "removeLayer"
    },

    /**
     * @class LayerView
     * @extends Backbone.View
     * @memberof Menu.Mobile.Layer
     * @constructs
     * @listens Layer#changeIsSelected
     * @listens Layer#changeIsVisibleInMap
     * @listens Layer#changeIsSettingVisible
     * @listens Layer#changeIsVisibleInTree
     * @listens Layer#changeIsOutOfRange
     * @listens Map#RadioTriggerMapChange
     * @fires Map#RadioRequestMapGetMapMode
     * @fires StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
     * @fires Parser#RadioTriggerParserRemoveItem
     */
    initialize: function () {
        checkChildrenDatasets(this.model);
        this.listenTo(this.model, {
            "change:isSelected change:isVisibleInMap": this.render,
            "change:isSettingVisible": this.renderSetting,
            "change:isVisibleInTree": this.removeIfNotVisible,
            "change:isOutOfRange": this.toggleColor
        });
        this.listenTo(Radio.channel("Map"), {
            "change": this.toggleByMapMode
        });

        // translates the i18n-props into current user-language. is done this way, because model's listener to languageChange reacts too late (after render, which ist riggered by creating new Menu)
        this.model.changeLang();
        this.toggleByMapMode(Radio.request("Map", "getMapMode"));
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "list-group-item",
    template: _.template(Template),
    templateSetting: _.template(SettingTemplate),


    /**
     * If the layer is outside its scale range,
     * if the view is grayed out and not clickable
     * @param {Backbone.Model} model - todo
     * @param {boolean} value - todo
     * @returns {void}
     */
    toggleColor: function (model, value) {
        if (model.has("minScale") === true) {
            if (value === true) {
                const statusCheckbox = this.$el.find(".glyphicon.glyphicon-unchecked").length;

                this.$el.addClass("disabled");
                this.$el.find("*").css("pointer-events", "none");
                if (statusCheckbox === 0) {
                    this.$el.find("div.pull-left").css("pointer-events", "auto");
                }
            }
            else {
                this.$el.removeClass("disabled");
                this.$el.find("*").css("pointer-events", "auto");
            }
        }
    },

    /**
     * todo
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("isSettingVisible") === true) {
            this.renderSetting();
        }
        return this;
    },

    /**
     * Draws the settings (transparency, metainfo, ...)
     * @returns {void}
     */
    renderSetting: function () {
        const attr = this.model.toJSON();

        // Animation Zahnrad
        this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
        // Slide-Animation templateSetting
        if (this.model.get("isSettingVisible") === false) {
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

    /**
     * todo
     * @returns {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },

    /**
     * todo
     * @returns {void}
     */
    toggleIsVisibleInMap: function () {
        this.model.toggleIsVisibleInMap();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },

    /**
     * todo
     * @returns {void}
     */
    showLayerInformation: function () {
        this.model.showLayerInformation();
        // Navigation wird geschlossen
        $("div.collapse.navbar-collapse").removeClass("in");
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
     * @param {*} evt - todo
     * @returns {void}
     */
    setTransparency: function (evt) {
        this.model.setTransparency(parseInt(evt.target.value, 10));
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
     * @fires StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
     * @returns {void}
     */
    openStyleWMS: function () {
        Radio.trigger("StyleWMS", "openStyleWMS", this.model);
        $(".navbar-collapse").removeClass("in");
    },

    /**
     * todo
     * @fires Parser#RadioTriggerParserRemoveItem
     * @returns {void}
     */
    removeLayer: function () {
        Radio.trigger("Parser", "removeItem", this.model.get("id"));
        this.model.removeLayer();
        this.$el.remove();
    },

    /**
     * adds only layers to the tree that support the current mode of the map
     * e.g. 2D, 3D
     * @param {String} mapMode - current mode from map
     * @returns {void}
     */
    toggleByMapMode: function (mapMode) {
        if (this.model.get("supported").indexOf(mapMode) >= 0) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }
});

export default LayerView;
