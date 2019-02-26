define(function (require) {

    var ItemTemplate = require("text!modules/menu/mobile/tool/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(ItemTemplate),
        events: {
            "click": "click"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisibleInTree": this.removeIfNotVisible
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },
        click: function () {
            this.model.activateViewpoint();
        },
        removeIfNotVisible: function () {
            if (!this.model.get("isVisibleInTree")) {
                this.remove();
            }
        }
    });

    return ItemView;
});
