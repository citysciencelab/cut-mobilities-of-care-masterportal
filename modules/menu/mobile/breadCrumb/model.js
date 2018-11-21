/**
 * @description Model to represent one breadcrumb in mobile mode
 * @module BreadCrumbItem
 * @extends Backbone.Model
 */
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
