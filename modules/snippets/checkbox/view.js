import Template from "text-loader!./template.html";
import TemplateClassic from "text-loader!./templateClassic.html";
import "bootstrap-toggle";

const CheckboxSnippetView = Backbone.View.extend({
    events: {
        "change input": "setIsSelected",
        // This event is fired when the info button is clicked
        "click .info-icon": "toggleInfoText"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "renderView": this.render,
            "removeView": this.remove,
            "change:currentLng": this.render
        }, this);
    },
    className: "checkbox-container",
    template: _.template(Template),
    templateClassic: _.template(TemplateClassic),

    render: function () {
        const attr = this.model.toJSON();

        if (attr.snippetType === "checkbox-classic") {
            this.$el.html(this.templateClassic(attr));
            this.delegateEvents();
        }
        else {
            this.$el.html(this.template(attr));
            this.initCheckbox();
            this.delegateEvents();
        }
        return this;
    },

    initCheckbox: function () {
        this.$el.find("input").bootstrapToggle({
            "on": this.model.get("textOn"),
            "off": this.model.get("textOff"),
            "size": this.model.get("size")
        });
    },

    /**
     * calls the function setIsSelected in the model
     * @param {evt} evt -
     * @return {void}
     */
    setIsSelected: function (evt) {
        this.model.setIsSelected($(evt.target).prop("checked"));
    },
    toggleInfoText: function () {
        const isInfoTextVisible = this.$el.find(".info-text").is(":visible");

        this.model.trigger("hideAllInfoText");
        if (!isInfoTextVisible) {
            this.$el.find(".info-text").toggle();
        }
    }
});

export default CheckboxSnippetView;
