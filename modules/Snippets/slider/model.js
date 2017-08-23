define(function () {

    var SliderModel = Backbone.Model.extend({
        defaults: {
            // increment step
            step: 1
        },

        initialize: function () {
            this.setMinValue(_.min(this.get("values")));
            this.setMaxValue(_.max(this.get("values")));

            this.setValues([this.get("minValue"), this.get("maxValue")]);
        },

        /**
         * set the minimum possible value
         * @param  {number} value
         */
        setMinValue: function (value) {
            this.set("minValue", value);
        },

        /**
         * set the maximum possible value
         * @param  {number} value
         */
        setMaxValue: function (value) {
            this.set("maxValue", value);
        },

        /**
         * set the slider value(s)
         * @param  {number | array} value - depending on type
         */
        setValues: function (value) {
            this.set("values", value);
        }
    });

    return SliderModel;
});
