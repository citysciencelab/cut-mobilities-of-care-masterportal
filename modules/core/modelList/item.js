/**
 * @namespace Item
 * @description Module to represent any Item (Folder, Tool, Layer, ...)
 */
const Item = Backbone.Model.extend(
    /** @lends Item.prototype */
    {
        /**
         * @class Item
         * @extends Backbone.Model
         * @memberof Item
         * @constructs
         * @property {String} name="" Name of item
         * @property {String} id="" Id of item
         * @property {String} parentId="" Parent id of item
         * @property {String} type="" Type of item: folder/layer/tool/staticlink
         * @property {String} title="no title defined" Title of item to be displayed
         * @property {String} glyphicon="" Bootstrap glyphicon class of item
         * @property {Boolean} isInThemen=false Flag if item is in layer tree
         * @property {Number} level=0 Level of selected layer
         * @property {Boolean} isVisibleInTree=false Flag if item is initially visible in layer tree
         */
        defaults: {
            name: "",
            id: "",
            parentId: "",
            type: "",
            title: "no title defined",
            glyphicon: "",
            isInThemen: false,
            level: 0,
            isVisibleInTree: false
        },
        setId: function (value) {
            this.set("id", value);
        },

        setParentId: function (value) {
            this.set("parentId", value);
        },

        setName: function (value) {
            this.set("name", value);
        },

        setType: function (type) {
            return this.set("type", type);
        },

        setGlyphicon: function (glyphicon) {
            return this.set("glyphicon", glyphicon);
        },

        setIsInThemen: function (value) {
            this.set("isInThemen", value);
        },

        setLevel: function (value) {
            this.set("level", value);
        },

        setIsVisibleInTree: function (value) {
            this.set("isVisibleInTree", value);
        }
    });

export default Item;
