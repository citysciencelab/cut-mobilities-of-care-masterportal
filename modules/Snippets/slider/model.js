define(function (require) {

    var SnippetModel = require("modules/Snippets/model"),
        SliderModel;

    SliderModel = SnippetModel.extend({
        initialize: function (attributes) {
            var parsedValues;
            // parent (SnippetModel) initialize
            this.superInitialize();
            parsedValues = this.parseValues(attributes.values);
            // slider range
            this.setRangeMinValue(_.min(parsedValues));
            this.setRangeMaxValue(_.max(parsedValues));
            this.addValueModels();

            this.listenToOnce(this, {
                "setRangeOnce": function (parsedValues) {
                    this.setRangeMinValue(_.min(parsedValues));
                    this.setRangeMaxValue(_.max(parsedValues));
                    this.resetValueModel(this.get("valuesCollection").at(0));
                    this.resetValueModel(this.get("valuesCollection").at(1));
                }
            });
        },

        /**
         * add minValueModel and maxValueModel to valuesCollection
         */
        addValueModels: function () {
            this.get("valuesCollection").add([
                {
                    attr: this.get("name"),
                    displayName: "ab",
                    value: this.get("rangeMinValue"),
                    isSelected: false,
                    type: this.get("type")
                },
                {
                    attr: this.get("name"),
                    displayName: "bis",
                    value: this.get("rangeMaxValue"),
                    isSelected: false,
                    type: this.get("type")
                }
            ]);
        },

        /**
         * call the updateValueModel function and/or the updateMaxValueModel
         * trigger the valueChanged event on snippetCollection in queryModel
         * @param  {number | array} value - depending on slider type
         */
        updateSelectedValues: function (snippetValues) {
            // range slider
            if (_.isArray(snippetValues) === true) {
                this.updateValueModel(this.get("valuesCollection").at(0), snippetValues[0], this.get("rangeMinValue"));
                this.updateValueModel(this.get("valuesCollection").at(1), snippetValues[1], this.get("rangeMaxValue"));
            }
            // slider
            else {
                this.updateValueModel(this.get("valuesCollection").at(0), snippetValues[0], this.get("rangeMinValue"));
            }
        },

        /**
         * set the slider value
         * if value unqequal rangeValue, set isSelected on true
         * @param  {number} value - slider min value
         */
        updateValueModel: function (valueModel, value, rangeValue) {
            valueModel.set("value", value);
            if (value !== rangeValue) {
                valueModel.set("isSelected", true);
                this.trigger("valuesChanged", valueModel);
            }
            else {
                valueModel.set("isSelected", false);
            }
        },

        /**
        * If the value model is no longer selected,
        * sets the value to the range value
        * @param  {Backbone.Model} valueModel
        */
        resetValueModel: function (valueModel) {
            if (valueModel.get("displayName") === "ab") {
                valueModel.set("value", this.get("rangeMinValue"));
            }
            else if (valueModel.get("displayName") === "bis") {
                valueModel.set("value", this.get("rangeMaxValue"));
            }
            this.trigger("render");
        },

        updateSelectableValues: function (values) {
            var parsedValues = this.parseValues(values);

            this.trigger("setRangeOnce", parsedValues);
        },

        /**
         * returns an object with the slider name and its values
         * @return {object} - contains the selected values
         */
        getSelectedValues: function () {
            return {
                attrName: this.get("name"),
                type: this.get("type"),
                values: this.get("valuesCollection").pluck("value")
            };
        },

        /**
         * parse strings into numbers if necessary
         * @param  {array} valueList
         * @return {number[]} parsedValueList
         */
        parseValues: function (valueList) {
            var parsedValueList = [];

            _.each(valueList, function (value) {
                if (_.isString(value)) {
                    value = parseInt(value, 10);
                }
                parsedValueList.push(value);
            });

            return parsedValueList;
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
