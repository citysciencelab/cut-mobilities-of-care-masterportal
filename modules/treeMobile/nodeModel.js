define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        Node;

    Node = Backbone.Model.extend({
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getIsVisible: function () {
            return this.get("isVisible");
        },
        setParentID: function (value) {
            this.set("parentID", value);
        },
        getParentID: function () {
            return this.get("parentID");
        },
        getType: function () {
            return this.get("type");
        },
        getTargetElement: function () {
            return this.get("targetElement");
        }
    });

    return Node;
});
