define(function (require) {
    require("slider");

    var Template = require("text!modules/Snippets/slider/template.html"),
        SliderView;

    SliderView = Backbone.View.extend({
        className: "slider-container",
        template: _.template(Template),
        events: {
            // Das Event wird getriggert wenn der Slider stoppt
            "slideStop .slider": "setValue"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            // var attr = this.model.toJSON();

            this.$el.html(this.template());
            this.$el.find("input").slider();
            $(".sidebar").append(this.$el);
        },

        /**
         * [description]
         * @param  {Event} evt - slideStop
         */
        setValue: function (evt) {
            console.log(evt.value);
        }
    });

    return SliderView;
});
