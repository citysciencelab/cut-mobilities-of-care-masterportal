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
            "click .info-icon": "toggleInfoText"
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

        toggleInfoText: function () {
            var isInfoTextVisible = this.$el.find(".info-text").is(":visible");

            if (!isInfoTextVisible) {
                this.model.trigger("hideAllInfoText");
                this.$el.find(".info-icon").css("opacity", "1");
                this.$el.find(".info-text").show();
            }
            else {
                this.$el.find(".info-icon").css("opacity", "0.4");
                this.$el.find(".info-text").hide();
            }
        }

    });

    return SliderView;
});
