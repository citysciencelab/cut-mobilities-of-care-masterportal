define([
    "modules/core/modelList/item",
    "eventbus"
], function () {

    var Item = require("modules/core/modelList/item"),
        EventBus = require("eventbus"),
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
            // Titel (Überschrift) der Funktion
            title: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Email Adresse
            email: undefined,
            // Name der Funktion
            name: "",
            // true wenn das Tool aktiviert ist
            isActive: false
        },

        initialize: function () {
            this.listenTo(this, {
                "change:isActive": this.activateTool
            });
        },

        activateTool: function () {
            EventBus.trigger("activateClick", this.get("name"));
            if (this.getName() === "legend") {
                EventBus.trigger("toggleLegendWin");
            }
            else if (this.get("name") !== "gfi" && this.get("name") !== "coord") {
                EventBus.trigger("toggleWin", [this.get("name"), this.get("title"), this.get("glyphicon")]);
            }
            else {
                EventBus.trigger("winParams", [false, false, ""]);
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
