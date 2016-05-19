define([
    "backbone",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Item;

    Item = Backbone.Model.extend({
        defaults: {
            id: "",
            parentId: "",
            type: "", // welcher Node-Type - folder/layer/tool ...
            title: "", //angezeigter Titel
            glyphicon: "", // Bootstrap Glyphicon Class
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
        setTitle: function (value) {
            this.set("title", value);
        },
        getTitle: function () {
            return this.get("title");
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
            return this.get("glyphicon", glyphicon);
        },
        // setIsVisible: function (value) {
        //     this.set("isVisible", value);
        // },
        // getIsVisible: function () {
        //     return this.get("isVisible");
        // },
        updateList: function (value) {
            console.log(this);
            this.collection.updateList(value, "slideForward");
            if (this.getType() === "folder") {
                Radio.trigger("BreadCrumb", "addItem", this);
            }
        }
    });

    return Item;
});
