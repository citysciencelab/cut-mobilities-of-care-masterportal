define([
    "backbone",
    "text!modules/treeMobile/templateItem.html"
], function () {

    var Backbone = require("backbone"),
        ItemTemplate = require("text!modules/treeMobile/templateItem.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(ItemTemplate),
        events: {
            "click": "changeMenuById"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.render
            });
        },
        render: function () {
            if (this.model.getIsVisible() === true) {
                var attr = this.model.toJSON();

                $(this.model.get("targetElement")).append(this.$el.html(this.template(attr)));
                this.delegateEvents(this.events);
            }
            else {
                this.$el.remove();
            }
        },
        changeMenuById: function () {
            this.model.changeMenuById(this.model.getId());
        }
    });

    return ItemView;
});
