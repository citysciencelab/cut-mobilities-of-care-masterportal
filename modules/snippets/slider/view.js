define(function (require) {
    var Template = require("text!modules/snippets/slider/template.html"),
        SliderView;

    require("slider");

    SliderView = Backbone.View.extend({
        events: {
            // This event fires when the dragging stops or has been clicked on
            "slideStop input.slider": function (evt) {
                this.model.updateValues(evt.value);
                this.setInputControlValue(evt);
            },
            // This event fires when the slider is dragged
            "slide input.slider": "setInputControlValue",
            // This event is fired when the info button is clicked
            "click .info-icon": "toggleInfoText",
            // This event fires if enter is clicked
            "keyup .form-control": "changeValuesByText"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "render": this.render
            });
        },

        className: "slider-container",
        template: _.template(Template),

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initSlider();
            return this.$el;
        },

        /**
         * init the slider
         * @returns {void}
         */
        initSlider: function () {
            var valueModel = this.model.get("valueCollection").models[0];

            this.$el.find("input.slider").slider({
                min: valueModel.get("min"),
                max: valueModel.get("max"),
                step: 1,
                value: valueModel.value
            });
        },

        /**
         * set the input value
         * @param {Event} evt - slide
         * @returns {void}
         */
        setInputControlValue: function (evt) {
            this.$el.find("input.form-control").val(evt.value);
        },

        /**
         * set the input values
         * @param {array} values - contains minimum and maximum
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
            this.model.trigger("hideAllInfoText");
            this.$el.find(".info-text").toggle();
        },

        /**
         * change the values by input from inputfields
         * render change if enter is pressed
         * @returns {void}
         */
        changeValuesByText: function () {
            var min,
                max,
                initValues,
                values,
                lastValues;

            if (event.keyCode === 13) {
                min = this.$el.find("input.form-minimum").prop("value");
                max = this.$el.find("input.form-maximum").prop("value");
                initValues = this.model.getValuesCollection().pluck("initValue");

                // check if input is allowed
                if (min === "" && max !== "") {
                    max = this.checkInvalidInput(parseInt(max, 10), initValues[1]);
                    min = initValues[0];
                }
                else if (min !== "" && max === "") {
                    min = this.checkInvalidInput(parseInt(min, 10), initValues[0]);
                    max = initValues[1];
                }
                else {
                    lastValues = this.model.getValuesCollection().pluck("value");

                    min = this.checkInvalidInput(parseInt(min, 10), lastValues[0]);
                    max = this.checkInvalidInput(parseInt(max, 10), lastValues[1]);
                }

                values = [min, max];

                this.model.updateValues(values);
                this.setInputMinAndMaxValue(values);
            }

        },

        /**
         * check if value is valid parameter or set value to initValue
         * @param {number} value - input value
         * @param {number} otherValue - value that be set if param value NaN
         * @returns {number} val
         */
        checkInvalidInput: function (value, otherValue) {
            var val = value;

            if (_.isNaN(val)) {
                val = otherValue;
                this.errorMessage();
            }

            return val;
        },

        /**
         * returns an error message for invalid inputs
         * @returns {void}
         */
        errorMessage: function () {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Fehlerhafte Eingabe,"
                    + " Bitte eine ganze Zahl eingeben!</strong>",
                kategorie: "alert-danger"
            });
        }
    });

    return SliderView;
});
