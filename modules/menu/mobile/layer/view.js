import Template from "text-loader!./template.html";
import SelectionTemplate from "text-loader!./templateSelection.html";
import SettingsTemplate from "text-loader!./templateSettings.html";

const LayerView = Backbone.View.extend({
    events: {
        "click .layer-item": "toggleIsSelected",
        "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
        "click .selected-layer-item > .glyphicon-remove": "removeFromSelection",
        "click .selected-layer-item > div": "toggleIsVisibleInMap",
        "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
        "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp",
        "click .layer-sort-item > .glyphicon-triangle-bottom": "moveModelDown",
        "change select": "setTransparency",
        "click .glyphicon-picture": "openStyleWMS"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isSelected change:isVisibleInMap": this.render,
            "change:isSettingVisible": this.renderSetting,
            "change:isVisibleInTree": this.removeIfNotVisible,
            "change:isOutOfRange": this.toggleColor
        });
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "list-group-item",
    template: _.template(Template),
    templateSelected: _.template(SelectionTemplate),
    templateSetting: _.template(SettingsTemplate),

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
            }
            else {
                this.$el.removeClass("disabled");
                this.$el.find("*").css("pointer-events", "auto");
            }
        }
    },
    render: function () {
        var attr = this.model.toJSON();

        if (Radio.request("BreadCrumb", "getLastItem").get("id") === "SelectedLayer") {
            this.$el.html(this.templateSelected(attr));
            if (this.model.get("isSettingVisible") === true) {
                this.renderSetting();
            }
        }
        else {
            this.$el.html(this.template(attr));
        }

        return this;
    },

    /**
     * Zeichnet die Einstellungen (Transparenz, Metainfos, ...)
     * @returns {void}
     */
    renderSetting: function () {
        var attr = this.model.toJSON();

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

    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        Radio.trigger("ModelList", "setIsSelectedOnParent", this.model);
        this.render();
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
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    },
    openStyleWMS: function () {
        Radio.trigger("StyleWMS", "openStyleWMS", this.model);
        $(".navbar-collapse").removeClass("in");
    }

});

export default LayerView;
