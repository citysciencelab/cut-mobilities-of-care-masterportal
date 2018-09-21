define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ItemTemplate = require("text!modules/menu/desktop/viewpoint/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown dropdown-tools",
        template: _.template(ItemTemplate),
        events: {
            "click": "click"
        },
        initialize: function () {

            this.render();
            this.setCssClass();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        },

        /**
         * Abhängig davon ob ein Viepoint in die Menüleiste oder unter dem Punkt Ansichten gezeichnet wird,
         * bekommt die View eine andere CSS-Klasse zugeordent
         */
        setCssClass: function () {
            if (this.model.get("parentId") === "root") {
                this.$el.addClass("viewpoint-style");
                this.$el.find("span").addClass("hidden-sm");
            }
            else {
                this.$el.addClass("viewpoint-style");
            }
        },
        click: function(){
            this.model.activateViewpoint();
        }
    });


    return ItemView;
});
