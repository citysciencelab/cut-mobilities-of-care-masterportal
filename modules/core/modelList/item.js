define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        Item;

    Item = Backbone.Model.extend({
        defaults: {
            name: "",
            id: "",
            parentId: "",
            type: "", // welcher Node-Type - folder/layer/tool/staticlink ...
            title: "test", // angezeigter Titel
            glyphicon: "", // Bootstrap Glyphicon Class,
            isInThemen: false,
            level: 0,
            isVisibleInTree: false
        },
        setId: function (value) {
            this.set("id", value);
        },
        getId: function () {
            return this.get("id");
        },
        setParentId: function (value) {
            this.set("parentId", value);
        },
        getParentId: function () {
            return this.get("parentId");
        },
        setName: function (value) {
            this.set("name", value);
        },
        getName: function () {
            return this.get("name");
        },
        setType: function (type) {
            return this.set("type", type);
        },
        getType: function () {
            return this.get("type");
        },
        getGlyphicon: function () {
            return this.get("glyphicon");
        },
        setGlyphicon: function (glyphicon) {
            return this.set("glyphicon", glyphicon);
        },
        getIsInThemen: function () {
            return this.get("isInThemen");
        },
        setIsInThemen: function (value) {
            this.set("isInThemen", value);
        },
        getLevel: function () {
            return this.get("level");
        },
        setLevel: function (value) {
            this.set("level", value);
        },
        /**
         * Getter für Attribut "isVisibleInTree"
         * @return {boolean}
         */
        getIsVisibleInTree: function () {
            return this.get("isVisibleInTree");
        },
        /**
         * Setter für Attribut "isVisibleInTree"
         * @return {boolean}
         */
        setIsVisibleInTree: function (value) {
            this.set("isVisibleInTree", value);
        }
    });

    return Item;
});
