define(function (require) {

    var SnippetModel = require("modules/snippets/model"),
        ValueModel = require("modules/snippets/value/model"),
        DropdownModel;

    DropdownModel = SnippetModel.extend({
        defaults: {
            // true if the dropdown is open
            isOpen: false,
            // init dropdown values
            values: [],
            preselectedValues: [],
            // number of entries displayed
            numOfOptions: 10,
            isMultiple: true
        },

        initialize: function () {
            this.superInitialize();
            this.addValueModels(this.getValues());
            if (this.getPreselectedValues().length > 0) {
                this.updateSelectedValues(this.getPreselectedValues());
            }
            this.setValueModelsToShow(this.getValuesCollection().where({isSelectable: true}));
            this.listenTo(this.getValuesCollection(), {
                "change:isSelected": function () {
                    this.triggerValuesChanged();
                }
            });
        },

        /**
         * calls addValueModel for each value
         * @param {string[]} valueList - init dropdown values
         * @returns {void}
         */
        addValueModels: function (valueList) {
            _.each(valueList, function (value) {
                this.addValueModel(value);
            }, this);
        },

        /**
         * creates a model value and adds it to the value collection
         * @param  {string} value - value
         * @returns {void}
         */
        addValueModel: function (value) {
            this.getValuesCollection().add(new ValueModel({
                attr: this.getName(),
                value: value,
                displayName: this.getDisplayName(value),
                isSelected: false,
                isSelectable: true,
                type: this.getType()
            }));
        },

        getDisplayName: function (value) {
            if (this.getType() === "boolean") {
                if (value === "true") {
                    return "Ja";
                }

                return "Nein";

            }

            return value;

        },

        /**
        * resetCollection
        * @return {[type]} [description]
        */
        resetValues: function () {
            var collection = this.getValuesCollection().models;

            _.each(collection.models, function (model) {
                model.set("isSelectable", true);
            }, this);
        },

        /**
         * checks the value models if they are selected or not
         * @param {string|string[]} values - selected value(s) in the dropdown list
         * @returns {void}
         */
        updateSelectedValues: function (values) {
            var vals = values;

            if (!_.isArray(vals)) {
                if (!this.getIsMultiple()) {
                    this.setDisplayName(vals);

                }
                vals = [vals];
            }
            _.each(this.getValuesCollection().models, function (valueModel) {
                if (_.contains(vals, valueModel.get("value"))) {
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
         * @returns {void}
         */
        updateSelectableValues: function (values) {
            this.getValuesCollection().each(function (valueModel) {
                if (!_.contains(values, valueModel.get("value")) && !valueModel.get("isSelected")) {
                    valueModel.set("isSelectable", false);
                }
                else {
                    valueModel.set("isSelectable", true);
                }
            }, this);

            this.setValueModelsToShow(this.getValuesCollection().where({isSelectable: true}));
            this.trigger("render");
        },

        /**
         * sets the isOpen attribute
         * @param  {boolean} value - value
         * @returns {void}
         */
        setIsOpen: function (value) {
            this.set("isOpen", value);
        },

        /**
         * sets the valueModelsToShow attribute
         * @param  {Backbone.Model[]} value - all value models that can be selected
         * @returns {void}
         */
        setValueModelsToShow: function (value) {
            this.set("valueModelsToShow", value);
        },

        getSelectedValues: function () {
            var selectedModels = this.getValuesCollection().where({isSelected: true}),
                obj = {
                    attrName: this.getName(),
                    type: this.getType(),
                    values: []
                };

            if (selectedModels.length > 0) {
                _.each(selectedModels, function (model) {
                    obj.values.push(model.get("value"));
                });
            }
            return obj;
        },
        setIsMultiple: function (value) {
            this.set("isMultiple", value);
        },
        getIsMultiple: function () {
            return this.get("isMultiple");
        },
        setDisplayName: function (value) {
            this.set("displayName", value);
        },
        getPreselectedValues: function () {
            return this.get("preselectedValues");
        }
    });

    return DropdownModel;
});
