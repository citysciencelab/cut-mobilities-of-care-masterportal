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
        renderToWindow: true
    },

    superInitialize: function () {
        var channel = Radio.channel("Tool");

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value && model.get("renderToWindow")) {
                    Radio.trigger("Window", "showTool", model);
                    Radio.trigger("Window", "setIsVisible", true);
                }
                else if (!value && model.get("renderToWindow")) {
                    Radio.trigger("Window", "setIsVisible", false);
                }
                if (model.get("deactivateGFI") && value) {
                    channel.trigger("activatedTool", "gfi", true);
                }
                else {
                    channel.trigger("activatedTool", "gfi", false);
                }
            }
        });

        if (this.get("isInitOpen")) {
            this.setIsActive("true");
        }
    },

    setIsActive: function (value, options) {
        this.set("isActive", value, options);
    }
});

export default Tool;
