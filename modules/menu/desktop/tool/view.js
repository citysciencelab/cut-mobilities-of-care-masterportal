define([
    "backbone",
    "text!modules/menu/desktop/tool/template.html"
], function () {

    var Backbone = require("backbone"),
        ItemTemplate = require("text!modules/menu/desktop/tool/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown dropdown-tools",
        template: _.template(ItemTemplate),
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));
        },
        checkItem: function () {
            this.model.checkItem();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        }
    });

    return ItemView;
});
