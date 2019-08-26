import Item from ".././item";

const Tool = Item.extend(/** @lends Tool.prototype */{
    defaults: {
        isVisibleInMenu: true,
        isRoot: false,
        parentId: "",
        glyphicon: "",
        name: "",
        isActive: false,
        deactivateGFI: false,
        renderToWindow: true,
        supportedIn3d: ["coord", "gfi", "wfsFeatureFilter", "searchByCoord", "legend", "contact", "saveSelection", "measure", "parcelSearch"],
        supportedOnlyIn3d: ["shadow"],
        supportedInOblique: ["contact"],
        supportedOnlyInOblique: [],
        toolsToRenderInSidebar: ["filter", "schulwegrouting"]
    },
    /**
     * @class Tool
     * @description Abstract Class used for generating Tool models
     * @extends Item
     * @memberof Core.ModelList.Tool
     * @constructs
     * @property {Boolean} isVisibleInMenu=true Flag of Tool is visible in menu
     * @property {Boolean} is isRoot=false Flag if Tool button is shown on first level in menu
     * @property {String} parentId="" Id of Parent Object
     * @property {String} glyphicon="" default glyphicon. Icon gets shown before tool name
     * @property {String} name="" default name
     * @property {Boolean} isActive=false Flag if tool is active
     * @property {Boolean} deactivateGFI=false Flag if tool should deactivate gfi
     * @property {Boolean} renderToWindow=true Flag if tool should be rendered in window
     * @property {String[]} supportedIn3d=["coord", "shadow", "gfi", "wfsFeatureFilter", "searchByCoord", "legend", "contact", "saveSelection", "measure", "parcelSearch"] Array of tool ids that are supported in 3d
     * @property {String[]} supportedOnlyIn3d=["shadow"] Array of tool ids that are only supported in 3d
     * @property {String[]} supportedInOblique=["contact"] Array of tool ids that are supported in oblique mode
     * @property {String[]} supportedInOblique=[] Array of tool ids that are only supported in oblique mode
     * @property {String[]} toolsToRenderInSidebar=["filter", "schulwegrouting"] Array of tool ids that are rendered in sidebar
     * @fires Core.ModelList.Tool#changeIsActive
     * @fires Window#RadioTriggerWindowShowTool
     * @fires Window#RadioTriggerWindowSetIsVisible
     * @fires Core#RadioTriggerAutostartInitializedModul
     * @listens Core.ModelList.Tool#changeIsActive
     * @listens Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
     * @listens Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
     * @listens Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
     * @listens Core.ModelList.Tool#RadioRequestToolGetCollection
     */
    superInitialize: function () {
        const channel = Radio.channel("Tool");

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                var gfiModel = model.collection.findWhere({id: "gfi"}),
                    activeTools = [];

                if (value) {
                    if (model.get("renderToWindow")) {
                        Radio.trigger("Window", "showTool", model);
                        Radio.trigger("Window", "setIsVisible", true);
                    }
                    if (model.get("keepOtherToolsOpened") !== true) {
                        this.collection.setActiveToolsToFalse(model);
                    }

                    if (gfiModel) {
                        gfiModel.setIsActive(!model.get("deactivateGFI"));
                    }
                }
                else {

                    if (model.get("renderToWindow")) {
                        Radio.trigger("Window", "setIsVisible", false);
                    }
                    activeTools = model.collection.where({isActive: true});

                    if (activeTools.length === 0) {
                        model.collection.toggleDefaultTool();
                    }
                }
            }
        });

        channel.reply({
            getSupportedIn3d: this.get("supportedIn3d"),
            getSupportedOnlyIn3d: this.get("supportedOnlyIn3d"),
            getSupportedOnlyInOblique: this.get("supportedOnlyInOblique"),
            getCollection: this.collection
        });

        Radio.trigger("Autostart", "initializedModul", this.get("id"));
        if (this.get("isInitOpen")) {
            this.setIsActive("true");
        }
    },
    /**
     * Activates or deactivates tool
     * @param {Boolean} value Flag if tool is active
     * @returns {void}
     */
    setIsActive: function (value) {
        this.set("isActive", value);
    }
});

export default Tool;
