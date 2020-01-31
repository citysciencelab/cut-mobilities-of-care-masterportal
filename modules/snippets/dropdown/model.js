import SnippetModel from "../model";
import ValueModel from "../value/model";

const DropdownModel = SnippetModel.extend(/** @lends DropdownModel.prototype */{
    /**
     * @class DropdownModel
     * @extends Snippets
     * @memberof Snippets.Dropdown
     * @constructs
     */
    defaults: {
        // true if the dropdown is open
        isOpen: false,
        // init dropdown values
        values: [],
        preselectedValues: [],
        // number of entries displayed
        numOfOptions: 10,
        isMultiple: true,
        isGrouped: false,
        liveSearch: false,
        isDropup: false
    },

    initialize: function () {
        this.superInitialize();

        this.postInitialize();

        this.listenTo(this.get("valuesCollection"), {
            "change:isSelected": function (model, value) {
                this.triggerValuesChanged(model, value);
            }
        });
        this.listenTo(this, {
            "change:values": function () {
                this.postInitialize();
            }
        });
    },

    postInitialize: function () {
        this.updateValueModels(this.get("values"), this.get("isGrouped"));
        if (this.get("preselectedValues").length > 0) {
            this.updateSelectedValues(this.get("preselectedValues"));
        }
        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}), this.get("isGrouped"));
    },

    /**
     * checks for each value whether it already exists and removes the models that are not in the valueList anymore
     * @param {string[] | object[]} valueList - init dropdown values
     * @param {boolean} isGrouped - flag if the objects should be grouped
     * @returns {void}
     */
    updateValueModels: function (valueList, isGrouped) {
        if (isGrouped) {
            // array of objects
            _.each(valueList, function (obj) {
                if (!this.get("valuesCollection").models.map(model => model.get("value")).includes(obj.value)) {
                    this.addValueModel(obj.value, obj.group);
                }
                else {
                    this.get("valuesCollection").remove(this.get("valuesCollection").models.filter((model) => !valueList.includes(model.get("value"))));
                }
            }, this);
        }
        else {
            // array of strings
            _.each(valueList, function (value) {
                if (!this.get("valuesCollection").models.map(model => model.get("value")).includes(value)) {
                    this.addValueModel(value);
                }
                else {
                    this.get("valuesCollection").remove(this.get("valuesCollection").models.filter((model) => !valueList.includes(model.get("value"))));
                }
            }, this);
        }
    },

    /**
     * creates a model value and adds it to the value collection
     * @param {string} value - value
     * @param {string|undefined} group - name of its group
     * @returns {void}
     */
    addValueModel: function (value, group) {
        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            value: value,
            group: group ? group : undefined,
            displayName: this.getDisplayName(value),
            isSelected: false,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    /**
     * Returns a string ja or nein
     * @param {string} value true or false
     * @returns {string} ja or nein
    */
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
    * @return {void}
    */
    resetValues: function () {
        var collection = this.get("valuesCollection").models;

        _.each(collection.models, function (model) {
            model.set("isSelectable", true);
        }, this);
    },

    /**
     * updateCollection
     * @param  {array} value - selected value
     * @return {void}
     */
    updateValues: function (value) {
        var collection = this.get("valuesCollection").models;

        _.each(collection, function (model, index) {
            model.set("value", value[index]);
            model.set("displayName", value[index]);
        }, this);
        if (this.get("preselectedValues").length > 0) {
            this.updateSelectedValues(this.get("preselectedValues"));
        }
        this.trigger("render");
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

        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}), this.get("isGrouped"));
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
     * @param {Backbone.Model[]} models - all value models that can be selected
     * @param {boolean} isGrouped - flag if the objects should be grouped
     * @returns {void}
     */
    setValueModelsToShow: function (models, isGrouped) {
        if (isGrouped) {
            this.set("valueModelsToShow", _.groupBy(models, function (model) {
                return model.get("group");
            }));
        }
        else {
            this.set("valueModelsToShow", models);
        }
    },

    /**
     * Returns an object with all values of the values collection
     * @returns {object} value object
    */
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

    /**
     * Setter for isMultiple
     * @param {boolean} value isMultiple
     * @returns {void}
     */
    setIsMultiple: function (value) {
        this.set("isMultiple", value);
    },

    /**
     * Setter for displayName
     * @param {string} value displayName
     * @returns {void}
     */
    setDisplayName: function (value) {
        this.set("displayName", value);
    }
});

export default DropdownModel;
