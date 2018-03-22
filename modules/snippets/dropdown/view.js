define(function (require) {
    require("bootstrap-select");

    var Template = require("text!modules/snippets/dropdown/template.html"),
        DropdownModel = require("modules/snippets/dropdown/model"),
        DropdownView;

    DropdownView = Backbone.View.extend({
        model: new DropdownModel(),
        className: "dropdown-container",
        // className: "container-fluid",
        template: _.template(Template),
        events: {
            // This event fires after the select's value has been changed
            "changed.bs.select": "updateSelectedValues",
            // This event is fired when the dropdown has been made visible to the user
            "shown.bs.select": "setIsOpen",
            // This event is fired when the dropdown has finished being hidden from the user
            "hidden.bs.select": "setIsOpen",
            // This event is fired when the info button is clicked
            "click .info-icon": "toggleInfoText"
        },

        initialize: function () {
             this.listenTo(this.model, {
                "render": this.render,
                "removeView": this.removeView
            });
        },

        /**
         * renders the view depending on the isOpen attribute
         * @return {jQuery} - this DOM element as a jQuery object
         */
        render: function () {
            if (this.model.get("isOpen") === false) {
                var attr = this.model.toJSON();

                this.$el.html(this.template(attr));
                this.initDropdown();
                this.markSelectedValues();
            }
            return this.$el;
        },

        /**
         * inits the dropdown list
         * @see {@link http://silviomoreto.github.io/bootstrap-select/options/|Bootstrap-Select}
         */
        initDropdown: function () {
            this.$el.find(".selectpicker").selectpicker({
                width: (_.isUndefined(this.model.get("infoText"))) ? "100%" : "85%",
                selectedTextFormat: "static",
                size: this.model.get("numOfOptions")
            });
        },

        /**
         * marks the selected value(s) in the dropdown list
         * @return {[type]} [description]
         */
        markSelectedValues: function () {
            var models = this.model.get("valuesCollection").where({isSelected: true}),
                values = [];

            _.each(models, function (model) {
                values.push(model.get("value"));
            });

            this.$el.find(".selectpicker").selectpicker("val", values);
        },

        /**
         * calls the function "updateSelectedValues" in the model
         * @param {Event} evt - changed
         */
        updateSelectedValues: function (evt) {
            this.model.updateSelectedValues($(evt.target).val());
        },

        /**
         * calls the function "setIsOpen" in the model depending on the event type
         * @param  {Event} evt - hidden || shown
         */
        setIsOpen: function (evt) {
            if (evt.type === "shown") {
                this.model.setIsOpen(true);
            }
            else {
                this.model.setIsOpen(false);
                this.render();
            }
        },

        /**
         * toggle the info text
         */
        toggleInfoText: function () {
            this.model.trigger("hideAllInfoText");
            this.$el.find(".info-text").toggle();
        },

        /**
         * calls the function "setIsOpen" in the model with parameter false
         * removes this view and its el from the DOM
         */
        removeView: function () {
            this.model.setIsOpen(false);
            this.remove();
        }

    });

    return DropdownView;
});
