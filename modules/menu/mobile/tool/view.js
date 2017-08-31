define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ItemTemplate = require("text!modules/menu/mobile/tool/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(ItemTemplate),
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisibleInTree": this.removeIfNotVisible
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.getIsVisibleInMenu() !== false) {
                this.$el.html(this.template(attr));
                return this;
            }
            else {
                return "";
            }
        },
        checkItem: function () {
            if (this.model.getId() === "legend") {
                Radio.trigger("Legend", "toggleLegendWin");
            }
            else {
                this.model.setIsActive(true);
            }
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        },
        removeIfNotVisible: function () {
            if (!this.model.getIsVisibleInTree()) {
                this.remove();
            }
        }
    });

    return ItemView;
});
