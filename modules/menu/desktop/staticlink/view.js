import ItemTemplate from "text-loader!./template.html";

const ItemView = Backbone.View.extend({
    events: {
        "click": function () {
            this.model.triggerRadioEvent();
        }
    },
    initialize: function () {
        this.render();
    },
    tagName: "li",
    className: function () {
        return this.model.getViewElementClasses();
    },
    template: _.template(ItemTemplate),
    render: function () {
        var attr = this.model.toJSON();

        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        return this;
    }
});

export default ItemView;
