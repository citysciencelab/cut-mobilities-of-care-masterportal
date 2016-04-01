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
            isExpanded: false,
            // true wenn alle Kinder ausgewöhlt sind
            isChecked: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // true wenn der Ordner nur Leafs als Kinder hat
            isLeafFolder: false,
            // UniqueId
            id: "",
            // Folder Glyphicon
            glyphicon: "glyphicon-plus-sign"
        },

        /**
         * Setter für Attribut "isExpanded"
         * @param {boolean} value - true | false
         */
        setIsExpanded: function (value) {
            this.set("isExpanded", value);
        },

        /**
         * Getter für Attribut "isExpanded"
         * @return {boolean} true | false
         */
        getIsExpanded: function () {
            return this.get("isExpanded");
        },

        /**
         * Setter für Attribut "isChecked"
         * @param {boolean} value - true | false
         */
        setIsChecked: function (value) {
            this.set("isChecked", value);
        },

        /**
         * Getter für Attribut "isChecked"
         * @return {boolean} true | false
         */
        getIsChecked: function () {
            return this.get("isChecked");
        },

        /**
         * "Toggled" das Attribut "isChecked"
         */
        toggleIsChecked: function () {
            if (this.getIsChecked() === true) {
                this.setIsChecked(false);
            }
            else {
                this.setIsChecked(true);
            }
        },

        /**
         * Getter für Attribut "isLeafFolder"
         * @return {boolean} true | false
         */
        getIsLeafFolder: function () {
            return this.get("isLeafFolder");
        }

    });

    return FolderModel;
});
