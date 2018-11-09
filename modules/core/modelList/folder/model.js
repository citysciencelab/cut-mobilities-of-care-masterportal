import Item from "../item";

const Folder = Item.extend({
    defaults: _.extend({}, Item.prototype.defaults, {
        // true wenn die Node zur ersten Ebene gehört
        isRoot: false,
        // true wenn der Inhalt(Kinder) der Node angezeigt wird
        isExpanded: false,
        isInitiallyExpanded: false,
        isAlwaysExpanded: false,
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
        selectAllGlyphicon: "glyphicon-unchecked",
        glyphicon: "glyphicon-folder-open",
        // these folder are not displayed in oblique mode
        obliqueModeBlacklist: ["tree", "tools"]
    }),

    initialize: function () {
        var items,
            isEveryLayerSelected;

        // Wenn alle Layer in einem Folder selektiert sind, wird der Folder auch selektiert
        if (this.get("parentId") === "Overlayer") {
            items = Radio.request("Parser", "getItemsByAttributes", {parentId: this.get("id")});
            isEveryLayerSelected = _.every(items, function (item) {
                return item.isSelected === true;
            });

            if (isEveryLayerSelected === true) {
                this.setIsSelected(true);
            }
        }
    },

    setIsExpanded: function (value, options) {
        this.set("isExpanded", value, options);
    },

    setIsSelected: function (value, silent) {
        if (_.isUndefined(silent)) {
            this.set("isSelected", value);
        }
        this.set("isSelected", value, {silent: silent});
    },

    /**
     * "Toggled" das Attribut "isChecked"
     * @returns {void}
     */
    toggleIsSelected: function () {
        if (this.get("isSelected") === true) {
            this.setIsSelected(false);
        }
        else {
            this.setIsSelected(true);
        }
    },

    toggleIsExpanded: function () {
        if (this.get("isExpanded") === true) {
            this.setIsExpanded(false);
        }
        else {
            this.setIsExpanded(true);
        }
        if (this.get("parentId") === "tree" && !this.get("isAlwaysExpanded")) {
            this.collection.toggleCatalogs(this.get("id"));
        }
    },

    setSelectAllGlyphicon: function (value) {
        this.set("selectAllGlyphicon", value);
    }
});

export default Folder;
