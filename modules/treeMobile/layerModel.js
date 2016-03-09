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
            parentID: "",
            // parent-View (listView)
            targetElement: "ul.tree-mobile",
            // true wenn der Layer ausgewählt ist
            isSelected: false
        }
    });

    return LayerModel;
});
