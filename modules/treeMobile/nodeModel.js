define([
    "backbone",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Node;

    Node = Backbone.Model.extend({
        setId: function (value) {
            this.set("id", value);
        },
        getId: function () {
            return this.get("id");
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getIsVisible: function () {
            return this.get("isVisible");
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
        getType: function () {
            return this.get("type");
        },
        updateList: function (value) {
            this.collection.updateList(value, "slideForward");
            if (this.getType() === "folder") {
                Radio.trigger("BreadCrumb", "addItem", this);
            }
        }
    });

    return Node;
});
