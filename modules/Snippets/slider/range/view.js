define(function (require) {
    require("slider");

    var Template = require("text!modules/Snippets/slider/range/template.html"),
        SliderRangeModel = require("modules/Snippets/slider/range/model"),
        SliderView;

    SliderView = Backbone.View.extend({
        model: new SliderRangeModel(),
        className: "slider-container",
        template: _.template(Template),
        events: {
            // Das Event wird getriggert wenn der Slider stoppt
            "slideStop .slider": "setFilterValue",
            // "slideStop .slider": "setValue",
            "slide .slider": "setValue"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            // var attr = this.model.toJSON();

            this.$el.html(this.template());
            this.$el.find("input.slider").slider({ });
            $(".sidebar").append(this.$el);
        },

        /**
         * [description]
         * @param  {Event} evt - slideStop
         */
        setValue: function (evt) {
            var inputControls = this.$el.find("input.form-control");

            $(inputControls[0]).val(evt.value[0]);
            $(inputControls[1]).val(evt.value[1]);
        },

        setFilterValue: function (evt) {
            console.log(evt.value);
        }
    });

    return SliderView;
});
