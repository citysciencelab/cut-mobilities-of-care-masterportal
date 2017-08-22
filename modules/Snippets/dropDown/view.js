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
            // this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initDropdown();
            // $(".sidebar").append(this.$el);
            // console.log(this.$el);
            return this.$el;
        },

        /**
         * init the dropdown
         */
        initDropdown: function () {
            this.$el.find(".selectpicker").selectpicker({
                width: "100%",
                selectedTextFormat: "static"
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
