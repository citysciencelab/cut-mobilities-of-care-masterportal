define([
    "modules/treeMobile/nodeModel"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        LayerModel;

    LayerModel = Node.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Id vom Layer Objekt
            layerId: "",
            // true wenn der Layer ausgewählt ist
            isChecked: false,
            // Layer Titel
            title: "dummydummydummydummy"
        },
        setIsChecked: function (value) {
            this.set("isChecked", value);
        },
        getIsChecked: function () {
            return this.get("isChecked");
        },
        toggleIsChecked: function () {
            if (this.getIsChecked() === true) {
                this.setIsChecked(false);
            }
            else {
                this.setIsChecked(true);
            }
        }
    });

    return LayerModel;
});
