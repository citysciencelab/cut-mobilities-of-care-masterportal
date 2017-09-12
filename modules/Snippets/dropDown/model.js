define(function (require) {

    var SnippetModel = require("modules/Snippets/model"),
        DropdownModel;

    DropdownModel = SnippetModel.extend({
        defaults: {
            // true if the dropdown is open
            isOpen: false,
            // init dropdown values
            values: [],
            // number of entries displayed
            numOfOptions: 10
        },

        initialize: function () {
            this.superInitialize();
            this.addValueModels(this.get("values"));
            this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        },

        /**
         * calls addValueModel for each value
         * @param {string[]} valueList - init dropdown values
         */
        addValueModels: function (valueList) {
            _.each(valueList, function (value) {
                this.addValueModel(value);
            }, this);
        },

        /**
         * creates a model value and adds it to the value collection
         * @param  {string} value
         */
        addValueModel: function (value) {
            this.get("valuesCollection").add({
                attr: this.get("name"),
                value: value,
                isSelected: false,
                isSelectable: true,
                type: this.get("type")
            });
        },

        /**
         * checks the value models if they are selected or not
         * @param {string|string[]} values - selected value(s) in the dropdown list
         */
        updateSelectedValues: function (values) {
            if (_.isString(values)) {
                values = [values];
            }
            _.each(this.get("valuesCollection").models, function (valueModel) {
                if (_.contains(values, valueModel.get("value"))) {
                    valueModel.set("isSelected", true);
                }
                else {
                    valueModel.set("isSelected", false);
                }
            });
        },

        /**
         * checks the value models if they are selectable or not
         * @param {string[]} values - filtered values
         * @fires DropdownView#render
         */
        updateSelectableValues: function (values) {
            this.get("valuesCollection").each(function (valueModel) {
                if (!_.contains(values, valueModel.get("value")) && !valueModel.get("isSelected")) {
                    valueModel.set("isSelectable", false);
                }
                else {
                    valueModel.set("isSelectable", true);
                }
            }, this);

            this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
            this.trigger("render");
        },

        /**
         * sets the isOpen attribute
         * @param  {boolean} value
         */
        setIsOpen: function (value) {
            this.set("isOpen", value);
        },

        /**
         * sets the valueModelsToShow attribute
         * @param  {Backbone.Model[]} value - all value models that can be selected
         */
        setValueModelsToShow: function (value) {
            this.set("valueModelsToShow", value);
        },

        getSelectedValues: function () {
            var selectedModels = this.get("valuesCollection").where({isSelected: true}),
                obj = {
                    attrName: this.get("name"),
                    type: this.get("type"),
                    values: []
                };

            if (selectedModels.length > 0) {
                _.each(selectedModels, function (model) {
                    obj.values.push(model.get("value"));
                });
            }
            return obj;
        }
    });

    return DropdownModel;
});
