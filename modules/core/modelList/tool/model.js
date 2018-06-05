define(function (require) {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        Tool;

    Tool = Item.extend({
        defaults: {
            // true wenn das Tool in der Menüleiste sichtbar ist
            isVisibleInMenu: true,
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
            isActive: false,
            // deaktiviert GFI, wenn dieses tool geöffnet wird
            deaktivateGFI: true,
            // Tools die in die Sidebar und nicht in das Fenster sollen
            toolsToRenderInSidebar: ["filter", "schulwegrouting"]
        },

        initialize: function () {
            var channel = Radio.channel("Tool");

            this.listenTo(this, {
                "change:isActive": function (model, value) {
                    console.log(value);
                    if (value) {
                        this.activateTool();
                        channel.trigger("activatedTool", this.getId(), this.get("deaktivateGFI"));
                    }
                    else {
                        channel.trigger("deactivatedTool", this.getId(), this.get("deaktivateGFI"));
                    }
                    if (_.contains(this.get("toolsToRenderInSidebar"), this.getId())) {
                        channel.trigger("activatedTool", "gfi", false);
                    }
                }
            });
        },

        activateTool: function () {
            if (this.getIsActive() === true) {
                // triggert das Ändern eines Tools
                Radio.trigger("ClickCounter", "toolChanged");
                this.collection.setActiveToolToFalse(this, this.get("deaktivateGFI"));

                if (this.getId() === "legend") {
                    Radio.trigger("Legend", "toggleLegendWin");
                }
                else if (this.getId() === "featureLister") {
                    Radio.trigger("FeatureListerView", "toggle");
                }
                else if (_.contains(this.get("toolsToRenderInSidebar"), this.getId())) {
                    Radio.trigger("Sidebar", "toggle", true);
                    Radio.trigger("Window", "closeWin", false);
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
        },
        getIsVisibleInMenu: function () {
            return this.get("isVisibleInMenu");
        }
    });

    return Tool;
});
