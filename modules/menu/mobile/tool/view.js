define(function (require) {

    var $ = require("jquery"),
        ItemTemplate = require("text!modules/menu/mobile/tool/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisibleInTree": this.removeIfNotVisible
            });
        },
        tagName: "li",
        className: "list-group-item",
        template: _.template(ItemTemplate),
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isVisibleInMenu") !== false) {
                this.$el.html(this.template(attr));
            }
            return this;
        },
        checkItem: function () {
            this.model.setIsActive(true);
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        },
        removeIfNotVisible: function () {
            if (!this.model.get("isVisibleInTree")) {
                this.remove();
            }
        }
    });

    return ItemView;
});
