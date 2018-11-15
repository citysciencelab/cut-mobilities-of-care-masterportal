import Template from "text-loader!./template.html";
import "bootstrap-select";

const DropdownView = Backbone.View.extend({
    events: {
        // This event fires after the select's value has been changed
        "click input": "updateSelectedValues",
        // // This event is fired when the dropdown has been made visible to the user
        // "shown.bs.select": "setIsOpen",
        // // This event is fired when the dropdown has finished being hidden from the user
        // "hidden.bs.select": "setIsOpen",
        // // This event is fired when the info button is clicked
        // "click .info-icon": "toggleInfoText"
    },

    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "removeView": this.removeView
        });
    },
    model: {},
    className: "multicheckbox-container",
    // className: "container-fluid",
    template: _.template(Template),

    /**
     * renders the view depending on the isOpen attribute
     * @return {jQuery} - this DOM element as a jQuery object
     */
    render: function () {
        var attr;

        attr = this.model.toJSON();
        this.$el.html(this.template(attr));
        this.delegateEvents();
        return this;
    },

    /**
     * calls the function "updateSelectedValues" in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    updateSelectedValues: function (evt) {
        this.model.updateSelectedValues(this.$(evt.target).next()[0].innerText, evt.target.checked);

    },

    /**
     * calls the function "setIsOpen" in the model with parameter false
     * removes this view and its el from the DOM
     * @returns {void}
     */
    removeView: function () {
        this.model.setIsOpen(false);
        this.remove();
    }

});

export default DropdownView;
