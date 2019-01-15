import Item from ".././item";

const Tool = Item.extend({
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
        // Name (Überschrift) der Funktion
        name: "",
        // true wenn das Tool aktiviert ist
        isActive: false,
        // deaktiviert GFI, wenn dieses tool geöffnet wird
        deactivateGFI: false,
        renderToWindow: true,
        supportedIn3d: ["coord", "gfi", "wfsFeatureFilter", "searchByCoord", "legend", "contact", "saveSelection", "measure", "parcelSearch"],
        supportedInOblique: ["contact"],
        // Tools die in die Sidebar und nicht in das Fenster sollen
        toolsToRenderInSidebar: ["filter", "schulwegrouting"]
    },
    superInitialize: function () {
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                var gfiModel = model.collection.findWhere({id: "gfi"});

                if (value) {
                    if (model.get("renderToWindow")) {
                        Radio.trigger("Window", "showTool", model);
                        Radio.trigger("Window", "setIsVisible", true);
                    }
                    if (gfiModel) {
                        gfiModel.setIsActive(!model.get("deactivateGFI"));
                    }
                }
                else {
                    if (gfiModel) {
                        gfiModel.setIsActive(false);
                    }
                    if (model.get("renderToWindow")) {
                        Radio.trigger("Window", "setIsVisible", false);
                    }
                }
            }
        });

        Radio.trigger("Autostart", "initializedModul", this.get("id"));
        if (this.get("isInitOpen")) {
            this.setIsActive("true");
        }
    },
    setIsActive: function (value, options) {
        this.set("isActive", value, options);
    }
});

export default Tool;
