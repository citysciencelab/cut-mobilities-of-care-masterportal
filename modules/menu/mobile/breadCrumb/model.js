define(function () {

    var BreadCrumbItem = Backbone.Model.extend({
        defaults: {
            // Name des Items
            name: "",
            // UniqueId
            id: ""
        },
        removeItems: function () {
            this.collection.removeItems(this);
        }
    });

    return BreadCrumbItem;
});
