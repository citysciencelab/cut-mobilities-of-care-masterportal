import SnippetModel from "../model";
import ValueModel from "../value/model";

const DropdownModel = SnippetModel.extend({
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
        this.addValueModels(this.get("values"));
        if (this.get("preselectedValues").length > 0) {
            this.updateSelectedValues(this.get("preselectedValues"));
        }
        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        this.listenTo(this.get("valuesCollection"), {
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
        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            value: value,
            displayName: this.getDisplayName(value),
            isSelected: false,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    getDisplayName: function (value) {
        if (this.get("type") === "boolean") {
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
        var collection = this.get("valuesCollection").models;

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

        if (!_.isArray(values)) {
            if (!this.get("isMultiple")) {
                this.setDisplayName(values);
            }
            vals = [vals];
        }
        _.each(this.get("valuesCollection").models, function (valueModel) {
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
    },
    setIsMultiple: function (value) {
        this.set("isMultiple", value);
    },
    setDisplayName: function (value) {
        this.set("displayName", value);
    }
});

export default DropdownModel;
