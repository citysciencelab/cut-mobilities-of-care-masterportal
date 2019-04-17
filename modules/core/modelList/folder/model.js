import Item from "../item";

const Folder = Item.extend(/** @lends Folder.prototype */{
    defaults: _.extend({}, Item.prototype.defaults, {
        isRoot: false,
        isExpanded: false,
        isInitiallyExpanded: false,
        isAlwaysExpanded: false,
        isSelected: false,
        type: "",
        parentId: "",
        isLeafFolder: false,
        id: "",
        selectAllGlyphicon: "glyphicon-unchecked",
        glyphicon: "glyphicon-folder-open",
        obliqueModeBlacklist: ["tree", "tools"]
    }),
    /**
     * @class Folder
     * @extends Item
     * @memberof Core.ModelList.Folder
     * @constructs
     * @property {Boolean} isRoot=false Flag if folder belongs to first level.
     * @property {Boolean} isExpanded=false Flag if folder is expanded.
     * @property {Boolean} isInitiallyExpanded=false Flag if folder is expanded initially.
     * @property {Boolean} isSelected=false Flag if all children are selected.
     * @property {String} type="" Flag what kind of item it is. "folder".
     * @property {String} parentId="" Id of parent node.
     * @property {Boolean} isLeafFolder=false Flag if folder does not have subfolders.
     * @property {String} id="" Unique id for folder.
     * @property {String} selectAllGlyphicon="glyphicon-unchecked" Glyphicon class of folder to select all children.
     * @property {String} glyphicon="glyphicon-folder-open" Glyphicon class of folder
     * @property {String[]} obliqueModeBlacklist=["tree,"tools"] List of folder ids that are not displayed in oblique mode("Schrägluftbilder").
     */
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

    /**
     * Setter for attribute "isExpanded".
     * @param {Boolean} value Flag for isExpanded.
     * @param {Object} options Backbone options for setter
     * @returns {void}
     */
    setIsExpanded: function (value, options) {
        this.set("isExpanded", value, options);
    },

    /**
     * Setter for attribute "isSelected"
     * @param {Boolean} value Flag for isSelected.
     * @param {Boolean} silent Flag if attribute should be set in silent-mode.
     * @returns {void}
     */
    setIsSelected: function (value, silent) {
        if (_.isUndefined(silent)) {
            this.set("isSelected", value);
        }
        this.set("isSelected", value, {silent: silent});
    },

    /**
     * Toggles the attribute "isSelected"
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

    /**
     * Toggles the attribute "isExpanded".
     * @returns {void}
     */
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

    /**
     * Sets the attribute "selectAllGlyphicon"
     * @param {String} value Glyphicon class.
     * @returns {void}
     */
    setSelectAllGlyphicon: function (value) {
        this.set("selectAllGlyphicon", value);
    }
});

export default Folder;
