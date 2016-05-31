define([
    "backbone",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Item;

    Item = Backbone.Model.extend({
        defaults: {
            name: "",
            id: "",
            parentId: "",
            type: "", // welcher Node-Type - folder/layer/tool ...
            title: "test", //angezeigter Titel
            glyphicon: "", // Bootstrap Glyphicon Class,
            isInThemen: false,
            level: 0
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
            return this.get("glyphicon", glyphicon);
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getIsVisible: function () {
            return this.get("isVisible");
        },
        updateList: function (value) {
            this.collection.updateList(value, "slideForward");
            // gehört hier nicht hin!?
            if (this.getType() === "folder") {
                Radio.trigger("BreadCrumb", "addItem", this);
            }
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
        }
    });

    return Item;
});
