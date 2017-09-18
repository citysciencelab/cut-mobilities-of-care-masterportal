define(function (require) {

    var Backbone = require("backbone"),
        ItemTemplate = require("text!modules/menu/mobile/staticlink/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(ItemTemplate),
        initialize: function () {
            this.render();
            this.listenTo(this.model, {
                "change:isVisibleInTree": this.removeIfNotVisible
            });
        },
        events: {
            "click": function () {
                this.model.triggerRadioEvent();
            }
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },
        removeIfNotVisible: function () {
            if (!this.model.getIsVisibleInTree()) {
                this.remove();
            }
        }
    });

    return ItemView;
});
