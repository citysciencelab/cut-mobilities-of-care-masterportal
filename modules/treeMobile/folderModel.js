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
            // true wenn der Inhalt(Kinder) der Node angezeigt wird
            // für die Steuerung der zwei Views zuständig
            isSelected: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // parent-View (listView)
            targetElement: "ul.tree-mobile",
            // true wenn der Ordner nur Leafs als Kinder hat
            isLeafFolder: false,
            // UniqueId
            id: "",
            // Folder Glyphicon
            glyphicon: "glyphicon-plus-sign"
        },
        getIsLeafFolder: function () {
            return this.get("isLeafFolder");
        },
        setIsSelected: function (value) {
            this.set("isSelected", value);
        },
        getIsSelected: function () {
            return this.get("isSelected");
        }
    });

    return FolderModel;
});
