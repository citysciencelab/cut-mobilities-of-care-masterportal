define([
    "modules/core/modelList/item"
], function () {

    var Item = require("modules/core/modelList/item"),
        Folder;

    Folder = Item.extend({
        defaults: {
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // true wenn der Inhalt(Kinder) der Node angezeigt wird
            isExpanded: false,
            // true wenn alle Kinder ausgewöhlt sind
            isSelected: false,
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

        initialize: function () {
            // console.log(this);
        },

        /**
         * Setter für Attribut "isExpanded"
         * @param {boolean} value - true | false
         */
        setIsExpanded: function (value, options) {
            this.set("isExpanded", value, options);
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
        setIsSelected: function (value) {
            this.set("isSelected", value);
        },

        /**
         * Getter für Attribut "isChecked"
         * @return {boolean} true | false
         */
        getIsSelected: function () {
            return this.get("isSelected");
        },

        /**
         * "Toggled" das Attribut "isChecked"
         */
        toggleIsSelected: function () {
            if (this.getIsSelected() === true) {
                this.setIsSelected(false);
            }
            else {
                this.setIsSelected(true);
            }
            this.collection.toggleIsSelectedLayers(this);
        },
        /**
         * Getter für Attribut "isLeafFolder"
         * @return {boolean} true | false
         */
        getIsLeafFolder: function () {
            return this.get("isLeafFolder");
        },
        toggleIsExpanded: function () {
            this.setIsExpanded(!this.getIsExpanded());
        }
    });

    return Folder;
});
