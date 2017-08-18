define(function () {

    var SliderModel = Backbone.Model.extend({
        defaults: {
            // increment step
            step: 1
        },

        initialize: function () {
            this.setMinValue(this.getValues()[0]);
            this.setMaxValue(this.getValues()[1]);

            if (this.get("type") === "slider") {
                this.setValues(this.getMinValue());
            }
        },

        /**
         * set the minimum possible value
         * @param  {number} value
         */
        setMinValue: function (value) {
            this.set("minValue", value);
        },

        /**
         * get the minimum possible value
         * @return {number}
         */
        getMinValue: function () {
            return this.get("minValue");
        },

        /**
         * set the maximum possible value
         * @param  {number} value
         */
        setMaxValue: function (value) {
            this.set("maxValue", value);
        },

        /**
         * get the maximum possible value
         * @return {number}
         */
        getMaxValue: function () {
            return this.get("maxValue");
        },

        /**
         * set the slider value(s)
         * @param  {number | array} value - depending on type
         */
        setValues: function (value) {
            this.set("values", value);
        },

        /**
         * get the slider value(s)
         * @return {number | array}
         */
        getValues: function () {
            return this.get("values");
        },

        /**
         * get the increment step
         * @return {number}
         */
        getStep: function () {
            return this.get("step");
        }
    });

    return SliderModel;
});
