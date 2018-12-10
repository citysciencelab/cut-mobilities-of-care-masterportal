import SnippetModel from "../model";
import ValueModel from "../value/model";

const MultiCheckboxModel = SnippetModel.extend({
    defaults: {
        values: [],
        preselectedValues: []
    },

    initialize: function () {
        this.superInitialize();
        this.addValueModels(this.get("values"));
        if (this.get("preselectedValues").length > 0) {
            this.get("preselectedValues").forEach(function (preselectedValue) {
                this.updateSelectedValues(preselectedValue, true);
            }, this);
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
            iconPath: this.getIconPath(value),
            displayName: value,
            isSelected: this.get("isInitialLoad") ? true : _.contains(this.get("preselectedValues"), value),
            isSelectable: true,
            type: this.get("type")
        }));
    },

    /**
     * creates a model value and adds it to the value collection
     * @param  {string} value - value
     * @returns {string} - path to Icon
     */
    getIconPath: function (value) {
        var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
            styleId,
            styleModel,
            valueStyle,
            iconPath;

        if (layerModel) {
            styleId = layerModel.get("styleId");

            if (styleId) {
                styleModel = Radio.request("StyleList", "returnModelById", styleId);
            }
        }

        if (styleModel) {
            valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                return styleFieldValue.styleFieldValue === value;
            });
        }

        if (valueStyle) {
            iconPath = styleModel.get("imagePath") + valueStyle[0].imageName;
        }

        return iconPath;
    },
    /**
    * resetCollection
    * @return {void}
    */
    resetValues: function () {
        var models = this.get("valuesCollection").models;

        _.each(models, function (model) {
            model.set("isSelectable", true);
        }, this);
    },

    /**
     * checks the value models if they are selected or not
     * @param {string|string[]} values - selected value(s) in the multicheckbox list
     * @param {boolean} checked - is checkbox checked or unchecked
     * @returns {void}
     */
    updateSelectedValues: function (value, checked) {
        _.each(this.get("valuesCollection").models, function (valueModel) {
            if (valueModel.get("displayName") === value.trim()) {
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
