define(function (require) {
    require("slider");

    var Template = require("text!modules/Snippets/slider/template.html"),
        SliderView;

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
            "click .info-icon": "toggleInfoText"
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
         */
        setInputControlValue: function (evt) {
            this.$el.find("input.form-control").val(evt.value);
        },

        /**
         * toggle the info text
         */
        toggleInfoText: function () {
            this.$el.find(".info-text").toggle();
        }

    });

    return SliderView;
});
