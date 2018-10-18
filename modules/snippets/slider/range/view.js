import Template from "text-loader!./template.html";
import SliderView from "../view";

const SliderRangeView = SliderView.extend({
    template: _.template(Template),

    /**
     * init the slider
     * @returns {void}
     */
    initSlider: function () {
        var valueModels = this.model.get("valuesCollection").models;

        this.$el.find("input.slider").slider({
            min: valueModels[0].get("initValue"),
            max: valueModels[1].get("initValue"),
            step: 1,
            precision: 3,
            value: [valueModels[0].get("value"), valueModels[1].get("value")]
        });
    },

    /**
     * set the inputs value
     * @param  {Event} evt - slide
     * @returns {void}
     */
    setInputControlValue: function (evt) {
        var inputControls = this.$el.find("input.form-control");

        this.$(inputControls[0]).val(evt.value[0]);
        this.$(inputControls[1]).val(evt.value[1]);
    }
});

export default SliderRangeView;
