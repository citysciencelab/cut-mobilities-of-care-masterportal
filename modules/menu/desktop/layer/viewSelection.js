import Template from "text-loader!./templateSelection.html";
import TemplateSettings from "text-loader!./templateSettings.html";
import checkChildrenDatasets from "../../checkChildrenDatasets.js";

const LayerView = Backbone.View.extend(/** @lends LayerView.prototype */{
    events: {
        "click .glyphicon-check, .title": "toggleIsVisibleInMap",
        "click .glyphicon-unchecked": "toggleIsVisibleInMap",
        "click .glyphicon-info-sign": "showLayerInformation",
        "click .glyphicon-remove-circle": "removeFromSelection",
        "click .glyphicon-cog": "toggleIsSettingVisible",
        "click .arrows > .glyphicon-arrow-up": "moveModelUp",
        "click .arrows > .glyphicon-arrow-down": "moveModelDown",
        "click .glyphicon-plus-sign": "incTransparency",
        "click .glyphicon-minus-sign": "decTransparency",
        "click .glyphicon-tint": "openStyleWMS",
        "click .remove-layer": "removeLayer"
    },

    /**
     * @class LayerView
     * @extends Backbone.View
     * @memberof Menu.Desktop.Layer
     * @constructs
     * @listens LayerInformation#RadioTriggerLayerInformationUnhighlightLayerInformationIcon
     */
    initialize: function () {
        checkChildrenDatasets(this.model);
        this.listenTo(this.model, {
            "change:isVisibleInMap": this.rerender,
            "change:isSettingVisible": this.renderSetting,
            "change:transparency": this.rerender,
            "change:isOutOfRange": this.toggleColor
        });
        this.listenTo(Radio.channel("LayerInformation"), {
            "unhighlightLayerInformationIcon": this.unhighlightLayerInformationIcon
        });
        // translates the i18n-props into current user-language. is done this way, because model's listener to languageChange reacts too late (after render, which ist riggered by creating new Menu)
        this.model.changeLang();
        this.render();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "layer-item list-group-item",
    template: _.template(Template),
    templateSettings: _.template(TemplateSettings),

    /**
     * Renders the selection view.
     * @returns {void}
     */
    render: function () {
        const selector = $("ul#SelectedLayer"),
            attr = this.model.toJSON();

        selector.prepend(this.$el.html(this.template(attr)));
        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
        }
        if (this.model.get("layerInfoChecked")) {
            this.highlightLayerInformationIcon();
        }
        return this;
    },

    /**
     * Rerenders the selection view.
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
        }
        if (this.model.get("layerInfoChecked")) {
            this.highlightLayerInformationIcon();
        }
    },

    /**
     * Draws the settings like transparence, metainfos etc.
     * @returns {void}
     */
    renderSetting: function () {
        const attr = this.model.toJSON();

        // Slide-Animation templateSetting
        if (this.model.get("isSettingVisible") === false) {
            // Animation Zahnrad
            this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
            this.$el.find(".layer-settings").slideUp("slow", function () {
                $(this).remove();
            });
        }
        else {
            this.$(".glyphicon-cog").toggleClass("rotate-back rotate");
            this.$el.append(this.templateSettings(attr));
            this.$el.find(".layer-settings").hide();
            this.$el.find(".layer-settings").slideDown();
        }
    },

    /**
     * Executes toggleIsSelected in the model
     * @returns {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
    },

    /**
     * Executes setIsSettingVisible and setIsSelected in the model
     * removes the element
     * @returns {void}
     */
    removeFromSelection: function () {
        this.model.setIsSettingVisible(false);
        this.model.setIsSelected(false);
        this.$el.remove();
    },

    /**
     * Executes toggleIsVisibleInMap in the model
     * @returns {void}
     */
    toggleIsVisibleInMap: function () {
        this.model.toggleIsVisibleInMap();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },

    /**
     * Executes showLayerInformation in the model
     * removes the class "in" from "div.collapse.navbar-collapse"
     * Executes highlightLayerInformationIcon
     * @returns {void}
     */
    showLayerInformation: function () {
        this.model.showLayerInformation();
        // Navigation wird geschlossen
        $("div.collapse.navbar-collapse").removeClass("in");
        this.highlightLayerInformationIcon();
    },

    /**
     * Executes toggleIsSettingVisible in the model
     * @returns {void}
     */
    toggleIsSettingVisible: function () {
        this.model.toggleIsSettingVisible();
    },

    /**
     * Executes moveDown in the model
     * @returns {void}
     */
    moveModelDown: function () {
        this.model.moveDown();
    },

    /**
     * Executes moveUp in the model
     * @returns {void}
     */
    moveModelUp: function () {
        this.model.moveUp();
    },

    /**
     * Executes incTransparency in the model
     * @returns {void}
     */
    incTransparency: function () {
        this.model.incTransparency(10);
    },

    /**
     * Executes decTransparency in the model
     * @returns {void}
     */
    decTransparency: function () {
        this.model.decTransparency(10);
    },

    /**
     * Triggers the styleWMS tool to open
     * Removes the class "open" from ".nav li:first-child"
     * @returns {void}
     */
    openStyleWMS: function () {
        Radio.trigger("StyleWMS", "openStyleWMS", this.model);
        $(".nav li:first-child").removeClass("open");
    },

    /**
     * Triggers the parser to remove the item/layer
     * Executes removeLayer in the model
     * Removes the element
     * @returns {void}
     */
    removeLayer: function () {
        Radio.trigger("Parser", "removeItem", this.model.get("id"));
        this.model.removeLayer();
        this.$el.remove();
    },

    /**
     * Enables and disables the layer depending upon the sclae of the map
     * @param {Backbone.Model} model layer model
     * @param {boolean} value Flag for isOutOfRange
     * @returns {void}
     */
    toggleColor: function (model, value) {
        if (model.has("minScale") === true) {
            let statusCheckbox = 0;

            if (value === true) {
                statusCheckbox = this.$el.find("span.glyphicon.glyphicon-unchecked").length;
                this.$el.addClass("disabled");
                this.$el.find("*").css("cursor", "not-allowed");
                this.$el.find("*").css("pointer-events", "none");
                if (statusCheckbox === 0) {
                    this.$el.find("span.pull-left").css({"pointer-events": "auto", "cursor": "pointer"});
                }
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

    /**
     * Highlights the Layer Information Icon in the layertree
     * @returns {void}
     */
    highlightLayerInformationIcon: function () {
        if (this.model.get("layerInfoChecked")) {
            this.$el.find("span.glyphicon-info-sign").addClass("highlightLayerInformationIcon");
        }
    },

    /**
     * Unhighlights the Layer Information Icon in the layertree
     * @returns {void}
     */
    unhighlightLayerInformationIcon: function () {
        this.$el.find("span.glyphicon-info-sign").removeClass("highlightLayerInformationIcon");
        this.model.setLayerInfoChecked(false);
    }
});

export default LayerView;
