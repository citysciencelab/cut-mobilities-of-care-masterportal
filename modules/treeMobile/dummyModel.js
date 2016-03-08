define([
    "modules/treeMobile/nodeModel"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        DummyModel;

    DummyModel = Node.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentID: 0,
            // parent-View (listView)
            targetElement: "ul.tree-mobile"
        }
    });

    return DummyModel;
});
