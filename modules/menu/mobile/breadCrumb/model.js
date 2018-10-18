const BreadCrumbItem = Backbone.Model.extend({
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

export default BreadCrumbItem;
