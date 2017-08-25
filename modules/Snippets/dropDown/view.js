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
            "changed.bs.select": "setSelectedValues"
        },
        initialize: function () {
            this.listenTo(this.model.get("valuesCollection"), {
                "change:isSelected": function (model) {
                    this.removeValueView(model);
                    this.updateSelectPicker();
                }
            }, this);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initDropdown();
            this.updateSelectPicker();
            return this.$el;
        },
        updateSelectPicker: function () {
            var models = this.model.get("valuesCollection").where({isSelected: true}),
                attributes = [];

            _.each(models, function (model) {
                attributes.push(model.get("value"));
            });
            this.$el.find(".selectpicker").selectpicker("val", attributes);
        },
        removeValueView: function (model) {
            model.trigger("removeView");
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
        setSelectedValues: function (evt) {
            this.model.setSelectedValues($(evt.target).val());
        }

    });

    return DropdownView;
});
