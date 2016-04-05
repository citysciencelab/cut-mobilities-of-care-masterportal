define([
    "backbone",
    "text!modules/treeMobile/item/template.html"
], function () {

    var Backbone = require("backbone"),
        ItemTemplate = require("text!modules/treeMobile/item/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(ItemTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        }
    });

    return ItemView;
});
