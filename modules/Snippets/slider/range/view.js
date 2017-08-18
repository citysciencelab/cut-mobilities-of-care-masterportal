define(function (require) {

    var Template = require("text!modules/Snippets/slider/range/template.html"),
        SliderView = require("modules/Snippets/slider/view"),
        SliderRangeView;

    SliderRangeView = SliderView.extend({
        template: _.template(Template),

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
