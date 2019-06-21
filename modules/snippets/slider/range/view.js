import Template from "text-loader!./template.html";
import SliderView from "../view";
/**
 * @member SliderRangeViewTemplate
 * @description Template used to create the SliderRange
 * @memberof Snippets.Slider
 */
const SliderRangeView = SliderView.extend(/** @lends SliderRangeView.prototype */{
    /**
     * @class SliderRangeView
     * @extends SliderView
     * @memberof Snippets.Slider
     * @constructs
     */
    template: _.template(Template),
    /**
     * init the slider
     * @returns {void}
     */
    initSlider: function () {
        const valueModels = this.model.get("valuesCollection").models,
            step = this.model.get("step"),
            selectedValues = valueModels[0].get("value") ? [valueModels[0].get("value"), valueModels[1].get("value")] : [valueModels[0].get("initValue"), valueModels[1].get("initValue")],
            precision = this.model.get("precision");

        this.$el.find("input.slider").slider({
            min: valueModels[0].get("initValue"),
            max: valueModels[1].get("initValue"),
            step: step,
            precision: precision,
            value: selectedValues
        });
    },

    /**
     * Sets the slider value to the DOM elements according to editableValueBox.
     * @param {Event} evt - slide
     * @returns {void}
     */
    setInputControlValue: function (evt) {
        let inputControls;

        if (this.model.get("editableValueBox") === true) {
            inputControls = this.$el.find("input.form-control");
            this.$(inputControls[0]).val(evt.value[0]);
            this.$(inputControls[1]).val(evt.value[1]);
        }
        else {
            inputControls = this.$el.find("label.valueBox");
            this.$(inputControls[0]).text(this.model.getValueText(evt.value[0]));
            this.$(inputControls[1]).text(this.model.getValueText(evt.value[1]));
        }
    }
});

export default SliderRangeView;
