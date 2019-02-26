import Template from "text-loader!./template.html";
import "bootstrap-slider";

const SliderView = Backbone.View.extend({
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
        // This event fires if key up
        "keyup .form-control": "setValues"
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

        return this;
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
        var isInfoTextVisible = this.$el.find(".info-text").is(":visible");

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
     * check which key is up
     * @param {event} event - key up
     * @returns {void}
     */
    setValues: function (event) {
        var min = this.$el.find("input.form-minimum").prop("value"),
            max = this.$el.find("input.form-maximum").prop("value"),
            values;

        if (event.keyCode === 13) {
            values = this.model.changeValuesByText(min, max);
            this.setInputMinAndMaxValue(values);
        }

        this.changeSizeOfInputFiled(event.target.className, event.target.value);
    },

    /**
     * change size from input field
     * @param {String} className - class from input field
     * @param {String} value - value from input field
     * @returns {void}
     */
    changeSizeOfInputFiled: function (className, value) {
        var defaultWidth = this.model.get("defaultWidth"),
            padding = parseInt(this.$(".form-control").css("padding").split("px")[1], 10),
            fontSize = parseInt(this.$(".form-control").css("font-size").split("px")[0], 10),
            buffer = 3,
            width = padding + fontSize + buffer,
            targetClass = this.chooseInputFiled(className);

        // get the default width for input field
        if (_.isUndefined(defaultWidth)) {
            defaultWidth = parseInt(this.$(".form-control").css("width").split("px")[0], 10);
            this.model.setDefaultWidth(defaultWidth);
        }

        // add a temporary span to get width from input text
        this.$(".form-inline").append("<span class='hiddenSpan'>" + value + "</span>");
        this.$(".hiddenSpan").text(this.$(targetClass).val());
        width = this.$(".hiddenSpan").width() + width;

        if (width > defaultWidth) {
            this.$(targetClass).css("width", width + "px");
        }
        else {
            this.$(targetClass).css("width", defaultWidth + "px");
        }
        this.$(".hiddenSpan").remove();
    },

    /**
     *  check which input field is used
     * @param {String} className - classes from input field
     * @returns {String} targetClass
     */
    chooseInputFiled: function (className) {
        var targetClass = "";

        if (className.includes("form-maximum")) {
            targetClass = ".form-maximum";
        }
        else if (className.includes("form-minimum")) {
            targetClass = ".form-minimum";
        }

        return targetClass;
    }
});

export default SliderView;
