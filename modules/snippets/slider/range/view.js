define(function (require) {

    var Template = require("text!modules/snippets/slider/range/template.html"),
        SliderView = require("modules/snippets/slider/view"),
        SliderRangeView;

    SliderRangeView = SliderView.extend({
        template: _.template(Template),

        /**
         * init the slider
         */
        initSlider: function () {
            var valueModels = this.model.get("valuesCollection").models;

            this.$el.find("input.slider").slider({
                min: valueModels[0].get("initValue"),
                max: valueModels[1].get("initValue"),
                step: 1,
                value: [valueModels[0].get("value"), valueModels[1].get("value")]
            });
        },

        /**
         * set the inputs value
         * @param  {Event} evt - slide
         */
        setInputControlValue: function (evt) {
            var inputControls = this.$el.find("input.form-control");

            $(inputControls[0]).val(evt.value[0]);
            $(inputControls[1]).val(evt.value[1]);
        }
    });

    return SliderRangeView;
});
