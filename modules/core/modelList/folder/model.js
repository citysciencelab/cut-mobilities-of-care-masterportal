define([
    "modules/core/modelList/item"
], function () {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        Folder;

    Folder = Item.extend({
        defaults: _.extend({}, Item.prototype.defaults, {
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // true wenn der Inhalt(Kinder) der Node angezeigt wird
            isExpanded: false,
            isInitiallyExpanded: false,
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
            // Glyphicon massen auswahl
            selectAllGlyphicon: "glyphicon-unchecked"
        }),

        initialize: function () {
            // Wenn alle Layer in einem Folder selektiert sind, wird der Folder auch selektiert
            if (this.get("parentId") === "Overlayer") {
                var items = Radio.request("Parser", "getItemsByAttributes", {parentId: this.get("id")}),
                    isEveryLayerSelected = _.every(items, function (item) {
                        return item.isSelected === true;
                    });

                if (isEveryLayerSelected === true) {
                    this.setIsSelected(true);
                }
            }
        },

        /**
         * Setter für Attribut "isExpanded"
         * @param {boolean} value - true | false
         */
        setIsExpanded: function (value, options) {
            this.set("isExpanded", value, options);
        },

        /**
         * Setter für Attribut "isChecked"
         * @param {boolean} value - true | false
         */
        setIsSelected: function (value, silent) {
            if (_.isUndefined(silent)) {
                silent = false;
            }
            this.set("isSelected", value, {silent: silent});
        },

        /**
         * "Toggled" das Attribut "isChecked"
         */
        toggleIsSelected: function () {
            if (this.get("isSelected") === true) {
                this.setIsSelected(false);
            }
            else {
                this.setIsSelected(true);
            }
            // this.collection.toggleIsSelectedLayers(this);
        },

        toggleIsExpanded: function () {
            if (this.get("isExpanded") === true) {
                this.setIsExpanded(false);
            }
            else {
                this.setIsExpanded(true);
            }
            if (this.get("parentId") === "tree") {
                this.collection.toggleCatalogs(this.get("id"));
            }
        },

        setSelectAllGlyphicon: function (value) {
            this.set("selectAllGlyphicon", value);
        }
    });

    return Folder;
});
