define(function (require) {

    const ItemTemplate = require("text!modules/menu/mobile/tool/template.html"),
        ItemView = Backbone.View.extend({

            events: {
                "click": "click"
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
                const attr = this.model.toJSON();

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
