define([
    "modules/treeMobile/nodeModel"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        FolderModel;

    FolderModel = Node.extend({
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
            // true wenn der Ordner nur Leafs als Kinder hat
            isLeafFolder: false
        },
        initialize: function () {
            this.setId(this.cid);
        },
        setIsLeafFolder: function (value) {
            this.set("isLeafFolder", value);
        },
        getIsLeafFolder: function () {
            return this.get("isLeafFolder");
        }
    });

    return FolderModel;
});
