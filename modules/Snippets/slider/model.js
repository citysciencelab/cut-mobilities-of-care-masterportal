define(function (require) {

    var SnippetModel = require("modules/Snippets/model"),
        SliderModel;

    SliderModel = SnippetModel.extend({
        initialize: function () {
            // parent (SnippetModel) initialize
            this.superInitialize();
            // slider range
            this.setRangeMinValue(_.min(this.get("values")));
            this.setRangeMaxValue(_.max(this.get("values")));
            this.addValueModels();
        },

        /**
         * add minValueModel and maxValueModel to valuesCollection
         */
        addValueModels: function () {
            this.get("valuesCollection").add([
                {
                    id: "minModel",
                    attr: this.get("name"),
                    displayName: ">=",
                    value: this.get("rangeMinValue"),
                    isSelected: false,
                    type: this.get("type")
                },
                {
                    id: "maxModel",
                    attr: this.get("name"),
                    displayName: "<=",
                    value: this.get("rangeMaxValue"),
                    isSelected: false,
                    type: this.get("type")
                }
            ]);
        },

        /**
         * set the slider min value
         * if min value unqequal rangeMinValue, set isSelected on true
         * @param  {number} value - slider min value
         */
        updateMinValueModel: function (value) {
            var minModel = this.get("valuesCollection").at(0);

            minModel.set("value", value);
            if (value !== this.get("rangeMinValue")) {
                minModel.set("isSelected", true);
            }
        },

        /**
         * set the slider max value
         * if max value unqequal rangeMaxValue, set isSelected on true
         * @param  {number} value - slider max value
         */
        updateMaxValueModel: function (value) {
            var maxModel = this.get("valuesCollection").at(1);

            maxModel.set("value", value);
            if (value !== this.get("rangeMaxValue")) {
                maxModel.set("isSelected", true);
            }
        },

        /**
         * call the updateMinValueModel function and/or the updateMaxValueModel
         * trigger the valueChanged event on snippetCollection in queryModel
         * @param  {number | array} value - depending on slider type
         */
        updateValueModels: function (snippetValues) {
            // range slider
            if (_.isArray(snippetValues) === true) {
                this.updateMinValueModel(snippetValues[0]);
                this.updateMaxValueModel(snippetValues[1]);
            }
            // slider
            else {
                this.updateMinValueModel(snippetValues);
            }
            // listener in filter/query/detailView
            this.trigger("valuesChanged");
        },

        /**
         * set the minimum possible value
         * @param  {number} value
         */
        setRangeMinValue: function (value) {
            this.set("rangeMinValue", value);
        },

        /**
         * set the maximum possible value
         * @param  {number} value
         */
        setRangeMaxValue: function (value) {
            this.set("rangeMaxValue", value);
        }
    });

    return SliderModel;
});
