/**
 * @description Module to create value for snippets
 * @module SnippetValueView
 * @extends Backbone.View
 */
import Template from "text-loader!./template.html";

const SnippetValueView = Backbone.View.extend({
    events: {
        "click": "deselect"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "removeView": this.remove,
            "change:isSelected": function (model, isSelected) {
                if (!isSelected) {
                    this.remove();
                }
            }
        });
    },
    tagName: "span",
    className: "valueView value-text",
    template: _.template(Template),
    attributes: {
        title: "Auswahl löschen"
    },
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },
    deselect: function () {
        this.model.setIsSelected(false);
    }
});

export default SnippetValueView;
