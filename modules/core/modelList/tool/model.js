define([
    "backbone.radio",
    "modules/core/modelList/item",
    "eventbus"
], function () {

    var Item = require("modules/core/modelList/item"),
        EventBus = require("eventbus"),
        Radio = require("backbone.radio"),
        Tool;

    Tool = Item.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Email Adresse
            email: undefined,
            // Name (Überschrift) der Funktion
            name: "",
            // true wenn das Tool aktiviert ist
            isActive: false
        },

        initialize: function () {
            var channel = Radio.channel("Tool");

            this.listenTo(this, {
                "change:isActive": function () {
                    this.activateTool();
                    channel.trigger("activatedTool", this.getId());
                }
            });
        },

        activateTool: function () {
            if (this.getIsActive() === true) {
                // triggert das Ändern eines Tools
                Radio.trigger("ClickCounter", "toolChanged");
                this.collection.setActiveToolToFalse(this);
                Radio.trigger("Map", "activateClick", this.getId());
                if (this.getId() === "legend") {
                    Radio.trigger("Legend", "toggleLegendWin");
                }
                else if (this.getId() === "featureLister") {
                    EventBus.trigger("toggleFeatureListerWin");
                }
                else {
                    Radio.trigger("Window", "toggleWin", this);
                }
            }
        },

        /**
         * Setter für das Attribut "isActive"
         * @param {boolean} value
         * @param {Object} [options] - {silent: true} unterbindet das "change-Event"
         */
        setIsActive: function (value, options) {
            this.set("isActive", value, options);
        },

        /**
         * Getter für das Attribut "isActive"
         * @return {boolean}
         */
        getIsActive: function () {
            return this.get("isActive");
        },

        getEmail: function () {
            return this.get("email");
        }
    });

    return Tool;
});
