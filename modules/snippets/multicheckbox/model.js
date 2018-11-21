import SnippetModel from "../model";
import ValueModel from "../value/model";

const MultiCheckboxModel = SnippetModel.extend({
    defaults: {
        // init dropdown values
        values: [],
        preselectedValues: []
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
                this.trigger("render");
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
            iconPath: this.getIconPath(this.get("icons"), this.get("values"), value),
            displayName: value,
            isSelected: true,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    getIconPath: function (icons, valueArray, value) {
        var index = null;

        index = valueArray.indexOf(value);
        return icons[index];
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
     * @param {boolean} checked - is checkbox checked or unchecked
     * @returns {void}
     */
    updateSelectedValues: function (values, checked) {
        _.each(this.get("valuesCollection").models, function (valueModel) {
            if (valueModel.get("displayName") === values) {
                valueModel.set("isSelected", checked);
            }
        });
    },

    /**
     * checks the value models if they are selectable or not
     * @param {string[]} values - filtered values
     * @fires MultiCheckboxView#render
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
    setDisplayName: function (value) {
        this.set("displayName", value);
    }
});

export default MultiCheckboxModel;
