define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        BreadCrumbItem;

    BreadCrumbItem = Backbone.Model.extend({
        defaults: {
            // Name des Items
            name: "",
            // UniqueId
            id: ""
        },

        /**
         * Ruft removeItems in der Collection auf
         */
        removeItems: function () {
            this.collection.removeItems(this);
        }
    });

    return BreadCrumbItem;
});
