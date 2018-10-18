import Model from "./model";
import Template from "text-loader!./template.html";
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
            "removeView": this.remove
        }, this);
    },
    className: "checkbox-container",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.initCheckbox();
        this.delegateEvents();
        return this;
    },

    /**
     * inits the Checkbox
     */
    initCheckbox: function () {
        this.$el.find("input").bootstrapToggle({
            on: this.model.get("textOn"),
            off: this.model.get("textOff"),
            size: this.model.get("size")
        });
    },

    /**
     * calls the function setIsSelected in the model
     * @param {ChangeEvent} evt
     */
    setIsSelected: function (evt) {
        this.model.setIsSelected($(evt.target).prop("checked"));
    },
    toggleInfoText: function () {
        var isInfoTextVisible = this.$el.find(".info-text").is(":visible");

        this.model.trigger("hideAllInfoText");
        if (!isInfoTextVisible) {
            this.$el.find(".info-text").toggle();
        }
    },
});

export default CheckboxSnippetView;
