define(function (require) {

    var ItemTemplate = require("text!modules/menu/desktop/staticlink/template.html"),
        $ = require("jquery"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: function () {
            return this.model.getViewElementClasses();
        },
        template: _.template(ItemTemplate),
        initialize: function () {
            this.render();
        },
        events: {
            "click": function () {
                this.model.triggerRadioEvent();
            }
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
            return this;
        }
    });

    return ItemView;
});
