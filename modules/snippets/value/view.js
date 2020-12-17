import Template from "text-loader!./template.html";

const SnippetValueView = Backbone.View.extend({
    events: {
        "click": "deselect"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "removeView": this.remove,
            "change:currentLng": this.render,
            "change:isSelected": function (model, isSelected) {
                if (!isSelected) {
                    this.remove();
                }
            }
        });
        this.model.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.model.changeLang
        });
        this.model.changeLang(i18next.language);
    },
    tagName: "span",
    className: "valueView value-text",
    template: _.template(Template),
    attributes: {
        title: ""
    },
    render: function () {
        const attr = this.model.toJSON();

        this.attributes.title = this.model.get("deleteSelection");
        this.$el.html(this.template(attr));
        return this;
    },
    deselect: function () {
        this.model.setIsSelected(false);
    }
});

export default SnippetValueView;
