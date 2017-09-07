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
            "changed.bs.select": "setSelectedValues",
            //"hidden.bs.select": "render"
        },
        filter: function () {
            this.model.trigger("valuesChanged");
        },
        show: function () {
            this.$el.find(".selectpicker").selectpicker("toggle");
        },
        initialize: function () {
             this.listenTo(this.model, {
                "render": function () {
                    this.render();
                }
            });
        },
        render: function (evt) {
            if(this.$el.find(".dropdown-menu.inner").css("display") === "block") {

                var modelsToShow = this.model.get("valuesCollection").filter(function (model) { return model.get("isSelected") || model.get("isSelectable")});

                this.model.set("modelsToShow", modelsToShow);
                console.log(modelsToShow);
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                this.initDropdown();
            }
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
