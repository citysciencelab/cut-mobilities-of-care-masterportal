define([
    "backbone",
    "eventbus",
    "text!modules/menu/desktop/tool/template.html"
], function () {

    var Backbone = require("backbone"),
        EventBus = require("eventbus"),
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
            if (this.model.getName() === "legend") {
                EventBus.trigger("toggleLegendWin");
            }
            else {
                this.model.setIsActive(true);
            }
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        }
    });

    return ItemView;
});
