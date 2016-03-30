define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
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
        getTargetElement: function () {
            return this.get("targetElement");
        },
        changeMenuById: function (value) {
            this.collection.setAllModelsInvisible();
            this.collection.unsetIsExpanded(value);
            this.collection.setParentIdForBackItem(value);
            if (value !== "") {
                this.collection.setModelsVisible(value);
            }
            else {
                this.collection.showRootModels();
            }
        }
    });

    return Node;
});
