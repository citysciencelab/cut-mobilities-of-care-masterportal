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

        // initialize: function () {
        //     var channel = Radio.channel("Tool");

        //     this.listenTo(this, {
        //         "change:isActive": function (model, value) {
        //             if (value) {
        //                 this.activateTool();
        //                 channel.trigger("activatedTool", this.get("id"), this.get("deaktivateGFI"));
        //             }
        //             else {
        //                 channel.trigger("deactivatedTool", this.get("id"), this.get("deaktivateGFI"));
        //             }
        //             if (_.contains(this.get("toolsToRenderInSidebar"), this.get("id")) || this.get("id") === "legend" || this.get("id") === "compareFeatures") {
        //                 channel.trigger("activatedTool", "gfi", false);
        //             }
        //         }
        //     });
        // },
        superInitialize: function () {
            var channel = Radio.channel("Tool");

            this.listenTo(this, {
                "change:isActive": function (model, value) {
                    console.log(value);
                    if (value) {
                        Radio.trigger("Window", "showTool", model);
                        Radio.trigger("Window", "setIsVisible", true);
                        // Radio.trigger("Window", "toggleWin", this);
                        // this.activateTool();
                        channel.trigger("activatedTool", this.get("id"), this.get("deaktivateGFI"));
                    }
                    else {
                        channel.trigger("deactivatedTool", this.get("id"), this.get("deaktivateGFI"));
                    }
                    if (_.contains(this.get("toolsToRenderInSidebar"), this.get("id")) || this.get("id") === "legend" || this.get("id") === "compareFeatures") {
                        channel.trigger("activatedTool", "gfi", false);
                    }
                }
            });
        },

        activateTool: function () {
            if (this.get("isActive") === true) {
                // triggert das Ändern eines Tools
                Radio.trigger("ClickCounter", "toolChanged");
                if (this.get("id") !== "legend" && this.get("id") !== "compareFeatures") {
                    // this.collection.setActiveToolToFalse(this, this.get("deaktivateGFI"));
                }

                if (this.get("id") === "legend") {
                    Radio.trigger("Legend", "toggleLegendWin");
                }
                else if (this.get("id") === "featureLister") {
                    Radio.trigger("FeatureListerView", "toggle");
                }
                else if (_.contains(this.get("toolsToRenderInSidebar"), this.get("id"))) {
                    Radio.trigger("Sidebar", "toggle", true);
                    Radio.trigger("Window", "closeWin", false);
                }
                else if (this.get("id") === "compareFeatures") {
                    Radio.trigger("CompareFeatures", "setIsActivated", true);
                }
                else {
                    Radio.trigger("Window", "toggleWin", this);
                }
            }
        },

        setIsActive: function (value, options) {
            this.set("isActive", value, options);
        }
    });

    return Tool;
});
