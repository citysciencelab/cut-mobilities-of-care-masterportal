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
            if (this.get("id") === "3d_daten") {
                this.listenTo(Radio.channel("Map"), {
                    "change": function () {
                        this.trigger("toggle:3d_daten");
                    }
                });
            }
            
            // Wenn alle Layer in einem Folder selektiert sind, wird der Folder auch selektiert
            if (this.getParentId() === "Overlayer") {
                var items = Radio.request("Parser", "getItemsByAttributes", {parentId: this.getId()}),
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
        setIsSelected: function (value, silent) {
            if (_.isUndefined(silent)) {
                silent = false;
            }
            this.set("isSelected", value, {silent: silent});
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
            // this.collection.toggleIsSelectedLayers(this);
        },
        /**
         * Getter für Attribut "isLeafFolder"
         * @return {boolean} true | false
         */
        getIsLeafFolder: function () {
            return this.get("isLeafFolder");
        },
        toggleIsExpanded: function () {
            if (this.getIsExpanded() === true) {
                this.setIsExpanded(false);
            }
            else {
                this.setIsExpanded(true);
            }
            if (this.getParentId() === "tree") {
                this.collection.toggleCatalogs(this.getId());
            }
        },
        getIsInitiallyExpanded: function () {
            return this.get("isInitiallyExpanded");
        },
        setSelectAllGlyphicon: function (value) {
            this.set("selectAllGlyphicon", value);
        }
    });

    return Folder;
});
