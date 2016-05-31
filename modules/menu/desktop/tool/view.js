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
            this.setCssClass();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));
        },

        /**
         * Abhängig davon ob ein Tool in die Menüleiste oder unter dem Punkt Werkzeuge gezeichnet wird,
         * bekommt die View eine andere CSS-Klasse zugeordent
         */
        setCssClass: function () {
            if (this.model.getParentId() === "root") {
                this.$el.addClass("menu-style");
                this.$el.find("span").addClass("hidden-sm");
            }
            else {
                this.$el.addClass("tool-style");
            }
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
