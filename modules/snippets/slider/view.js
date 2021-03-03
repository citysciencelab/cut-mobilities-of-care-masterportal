import Template from "text-loader!./template.html";
import "bootstrap-slider";
import "jquery-ui/ui/widgets/draggable";
/**
 * @member SliderViewTemplate
 * @description Template used to create the simple slider
 * @memberof Snippets.Slider
 */
const SliderView = Backbone.View.extend(/** @lends SliderView.prototype */{
    /**
     * @class SliderView
     * @extends Backbone.View
     * @memberof Snippets.Slider
     * @constructs
     */
    events: {
        // This event fires when the dragging stops or has been clicked on
        "slideStop input.slider": "saveNewValue",
        // This event fires when the slider is dragged
        "slide input.slider": "setInputControlValue",
        // This event is fired when the info button is clicked
        "click .info-icon": "toggleInfoText",
        // This event fires if key up
        "keyup .form-control": "setValues",
        "focusout .form-control": "setValues"
    },

    className: "slider-container",

    /**
     * Setting listener
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "updateDOMSlider": this.updateDOMSlider,
            "removeView": this.remove,
            "change:currentLng": this.render
        }, this);
    },

    template: _.template(Template),

    /**
     * render methode
     * @returns {this} this
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.initSlider();
        this.delegateEvents();

        return this;
    },
    /**
     * init the slider
     * @returns {void}
     */
    initSlider: function () {
        const valueModels = this.model.get("valuesCollection").models,
            step = this.model.get("step"),
            selectedValue = valueModels[0].get("value") ? valueModels[0].get("value") : valueModels[0].get("initValue"),
            precision = this.model.get("precision"),
            selection = this.model.get("selection");

        this.$el.find("input.slider").slider({
            min: valueModels[0].get("initValue"),
            max: valueModels[1].get("initValue"),
            step: step,
            precision: precision,
            value: selectedValue,
            selection: selection,
            ticks: this.model.get("ticks")
        });

        this.$el.find("input.slider").draggable();
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
            this.$(inputControls[0]).val(evt.value);
        }
        else {
            inputControls = this.$el.find("label.valueBox");
            this.$(inputControls[0]).text(this.model.getValueText(evt.value));
        }
    },

    /**
     * Save data to model
     * @param {Event} evt - slide
     * @returns {void}
     */
    saveNewValue: function (evt) {
        this.model.updateValues(evt.value);
    },

    /**
     * set the input values
     * @param {number[]} values - contains minimum and maximum
     * @returns {void}
     */
    setInputMinAndMaxValue: function (values) {
        this.$el.find("input.form-minimum").val(values[0]);
        this.$el.find("input.form-maximum").val(values[1]);
    },

    /**
     * toggle the info text
     * @returns {void}
     */
    toggleInfoText: function () {
        const isInfoTextVisible = this.$el.find(".info-text").is(":visible");

        this.model.trigger("hideAllInfoText");
        if (!isInfoTextVisible) {
            this.model.trigger("hideAllInfoText");
            this.$el.find(".info-icon").css("opacity", "1");
            this.$el.find(".info-text").show();
        }
        else {
            this.$el.find(".info-icon").css("opacity", "0.4");
            this.$el.find(".info-text").hide();
        }
    },

    /**
     * Check which key is up.
     * @param {event} event - Key up or focusout.
     * @returns {void}
     */
    setValues: function (event) {
        const min = this.$el.find("input.form-minimum").prop("value"),
            max = this.$el.find("input.form-maximum").prop("value");

        if (event.keyCode === 13 || event.type === "focusout") {
            this.setInputMinAndMaxValue(this.model.changeValuesByText(min, max));
        }
    },

    /**
     * Check which input field is used.
     * @param {String} className - Classes from input field.
     * @returns {String} targetClass
     */
    chooseInputFiled: function (className) {
        let targetClass = "";

        if (className.includes("form-maximum")) {
            targetClass = ".form-maximum";
        }
        else if (className.includes("form-minimum")) {
            targetClass = ".form-minimum";
        }

        return targetClass;
    },

    /**
     * Sets the slider value after the external model change.
     * @param {number[]} value - Input Values.
     * @returns {void}
     */
    updateDOMSlider: function (value) {
        if (Array.isArray(value)) {
            this.checkValuesAreValid(value);
        }

        this.$el.find("input.slider").slider("setValue", value);
        this.setInputControlValue({value: value});
    },

    /**
     * Checks if the input value is valid. If not, an error message is displayed.
     * @param {number[]} value - Input Values.
     * @returns {void}
     */
    checkValuesAreValid: function (value) {
        const attributes = this.$el.find("input.slider").slider("getAttribute"),
            minValueSlider = attributes.min,
            maxValueSlider = attributes.max,
            minValueInput = Math.min(...value),
            maxValueInput = Math.max(...value);

        if (!this.model.checkAreAllValuesInRange([minValueInput, maxValueInput], minValueSlider, maxValueSlider)) {
            Radio.trigger("Alert", "alert", i18next.t("common:snippets.slider.outOfRangeErrorMessage",
                {
                    minValueSlider: minValueSlider,
                    maxValueSlider: maxValueSlider
                }));
        }
    }
});

export default SliderView;
