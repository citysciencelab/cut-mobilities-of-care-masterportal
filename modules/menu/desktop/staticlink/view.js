define(function (require) {

    var Backbone = require("backbone"),
        ItemTemplate = require("text!modules/menu/desktop/staticlink/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown dropdown-tools",
        template: _.template(ItemTemplate),
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
        }
    });

    return ItemView;
});
