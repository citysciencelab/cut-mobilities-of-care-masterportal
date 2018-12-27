/**
 * @namespace ModelList/Item
 * @description Module to represent any Item (Folder, Tool, Layer, ...)
 */
const Item = Backbone.Model.extend({
    defaults: {
        /**
         * @memberof ModelList/Item
         * @default ""
         * @type {String}
         */
        name: "",
        /**
         * @memberof ModelList/Item
         * @default ""
         * @type {String}
         */
        id: "",
        /**
         * @memberof ModelList/Item
         * @default ""
         * @type {String}
         */
        parentId: "",
        /**
         * @memberof ModelList/Item
         * which node type folder/layer/tool/staticlink
         * @default ""
         * @type {String}
         */
        type: "",
        /**
         * @memberof ModelList/Item
         * displayed title
         * @default "no title defined"
         * @type {String}
         */
        title: "no title defined",
        /**
         * @memberof ModelList/Item
         * bootstrap glyphicon class
         * @default ""
         * @type {String}
         */
        glyphicon: "",
        /**
         * @memberof ModelList/Item
         * @default false
         * @type {Boolean}
         */
        isInThemen: false,
        /**
         * @memberof ModelList/Item
         * @default 0
         * @type {Number}
         */
        level: 0,
        /**
         * @memberof ModelList/Item
         * @default false
         * @type {Boolean}
         */
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
