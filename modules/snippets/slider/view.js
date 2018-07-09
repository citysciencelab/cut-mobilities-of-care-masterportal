define(function (require) {
    var Template = require("text!modules/snippets/slider/template.html"),
        SliderView;

    require("slider");

    SliderView = Backbone.View.extend({
        className: "slider-container",
        template: _.template(Template),
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
            "keyup .form-control": "toggleSlider"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "render": this.render
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
         * toggle the info text
         * @returns {void}
         */
        toggleInfoText: function () {
            this.model.trigger("hideAllInfoText");
            this.$el.find(".info-text").toggle();
        },

        toggleSlider: function () {
            var min,
                max;

            if (event.keyCode === 13) {
                min = this.$el.find("input.form-minimum").prop("value");
                max = this.$el.find("input.form-maximum").prop("value");
                console.log(min);
                console.log(max);
            }

        }

    });

    return SliderView;
});
