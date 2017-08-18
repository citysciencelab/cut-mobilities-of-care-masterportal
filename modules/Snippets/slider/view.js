define(function (require) {
    require("slider");

    var Template = require("text!modules/Snippets/slider/template.html"),
        SliderModel = require("modules/Snippets/slider/model"),
        SliderView;

    SliderView = Backbone.View.extend({
        model: new SliderModel(),
        className: "slider-container",
        template: _.template(Template),
        events: {
            // Das Event wird getriggert wenn der Slider stoppt
            "slideStop .slider": "setFilterValue",
            "slide .slider": "setValue"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();
console.log(attr);
            this.$el.html(this.template(attr));
            this.$el.find("input.slider").slider();
            $(".sidebar").append(this.$el);
        },

        /**
         * [description]
         * @param  {Event} evt - slideStop
         */
        setFilterValue: function (evt) {
            console.log(evt.value);
            // this.model.set("value", evt.value);
            this.$el.find("input.form-control").val(evt.value);
        },

        setValue: function (evt) {
            this.$el.find("input.form-control").val(evt.value);
            console.log(evt.value);
        }
    });

    return SliderView;
});
