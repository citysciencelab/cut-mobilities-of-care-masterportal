define(function (require) {
    require("slider");

    var Template = require("text!modules/Snippets/slider/template.html"),
        SliderModel = require("modules/Snippets/slider/model"),
        SliderView;

    SliderView = Backbone.View.extend({
        model: new SliderModel({type: "slider", label: "Label Name", values: [0, 40]}),
        className: "slider-container",
        template: _.template(Template),
        events: {
            // This event fires when the dragging stops or has been clicked on
            "slideStop input.slider": "setValues",
            // This event fires when the slider is dragged
            "slide input.slider": "setInputControlValue"
        },
        initialize: function () {
            this.render();
            this.initSlider();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".sidebar").append(this.$el);
        },

        /**
         * init the slider
         */
        initSlider: function () {
            this.$el.find("input.slider").slider({
                min: this.model.getMinValue(),
                max: this.model.getMaxValue(),
                step: this.model.getStep(),
                value: this.model.getValues()
            });
        },

        /**
         * set the input value
         * @param {Event} evt - slide
         */
        setInputControlValue: function (evt) {
            this.$el.find("input.form-control").val(evt.value);
        },

        /**
         * Call the function "setValues" in the model
         * @param {Event} evt - slideStop
         */
        setValues: function (evt) {
            this.model.setValues(evt.value);
        }

    });

    return SliderView;
});
