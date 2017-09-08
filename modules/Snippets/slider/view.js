define(function (require) {
    require("slider");

    var Template = require("text!modules/Snippets/slider/template.html"),
        SliderModel = require("modules/Snippets/slider/model"),
        SliderView;

    SliderView = Backbone.View.extend({
        className: "slider-container",
        template: _.template(Template),
        events: {
            // This event fires when the dragging stops or has been clicked on
            "slideStop input.slider": function (evt) {
                this.updateValueModels(evt);
                this.setInputControlValue(evt);
            },
            // This event fires when the slider is dragged
            "slide input.slider": "setInputControlValue"
        },

        initialize: function () {
            this.listenTo(this.model.get("valuesCollection"), {
                "change:isSelected": this.updateValueModel
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initSlider();
            return this.$el;
        },

        /**
         * init the slider
         */
        initSlider: function () {
            this.$el.find("input.slider").slider({
                min: this.model.get("rangeMinValue"),
                max: this.model.get("rangeMaxValue"),
                step: 1,
                value: this.model.get("rangeMinValue")
            });
        },

        /**
         * If the value model is no longer select,
         * the corresponding update function is called up in the model
         * @param  {Backbone.Model} valueModel
         * @param  {boolean} value - isSelected
         */
        updateValueModel: function (valueModel, value) {
            if (value === false) {
                if (valueModel.get("id") === "minModel") {
                    this.model.updateMinValueModel(this.model.get("rangeMinValue"));
                }
                else if (valueModel.get("id") === "maxModel") {
                    this.model.updateMaxValueModel(this.model.get("rangeMaxValue"));
                }
                this.render();
            }
        },

        /**
        * Call the function "updateValueModels" in the model
        * @param {Event} evt - slideStop
        */
        updateValueModels: function (evt) {
            this.model.updateValueModels(evt.value);
        },

        /**
         * set the input value
         * @param {Event} evt - slide
         */
        setInputControlValue: function (evt) {
            this.$el.find("input.form-control").val(evt.value);
        }

    });

    return SliderView;
});
