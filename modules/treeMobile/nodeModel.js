define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        Node;

    Node = Backbone.Model.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentID: 0
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getIsVisible: function () {
            return this.get("isVisible");
        },
        getType: function () {
            return this.get("type");
        },
        setParentID: function (value) {
            this.set("parentID", value);
        },
        getParentID: function () {
            return this.get("parentID");
        }
    });

    return Node;
});
