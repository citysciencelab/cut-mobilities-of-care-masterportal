define(function (require) {
    require("bootstrap-select");

    var Template = require("text!modules/Snippets/dropdown/template.html"),
        DropdownModel = require("modules/Snippets/dropdown/model"),
        DropdownView;

    DropdownView = Backbone.View.extend({
        model: new DropdownModel(),
        className: "dropdown-container",
        template: _.template(Template),
        events: {
            // This event fires after the select's value has been changed
            "changed.bs.select": "setValues"
        },
        initialize: function () {
            this.render();
            this.initDropdown();
        },
        render: function () {
            // var attr = this.model.toJSON();

            this.$el.html(this.template());
            $(".sidebar").append(this.$el);
        },

        /**
         * init the dropdown
         */
        initDropdown: function () {
            this.$el.find(".selectpicker").selectpicker({
                width: "100%"
            });
        },

        /**
         * Call the function "setValues" in the model
         * @param {Event} evt - changed
         */
        setValues: function (evt) {
            this.model.setValues($(evt.target).val());
        }

    });

    return DropdownView;
});
