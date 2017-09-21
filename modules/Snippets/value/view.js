define(function (require) {

    var Model = require("modules/snippets/value/model"),
        Template = require("text!modules/snippets/value/template.html"),
        View;

    View = Backbone.View.extend({
        Model: {},
        tagName: "span",
        className: "valueView value-text",
        template: _.template(Template),
        attributes: {
            title: "Auswahl löschen"
        },
        events: {
            "click": "deselect"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "removeView": this.remove,
                "change:isSelected": function () {
                    if (!this.model.get("isSelected")) {
                        this.remove();
                    }
                }
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this.$el;
        },
        deselect: function () {
            this.model.setIsSelected(false);
        }
    });
    return View;
});
