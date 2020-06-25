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
    /**
     * @class DropdownModel
     * @extends SnippetModel
     * @memberof Snippets.Dropdown
     * @namespace GraphicalSelect
     * @description creates a dropdown
     * @constructs
     * @property {Boolean} isOpen=false dropdown is open or closed
     * @property {Boolean} values=[] init dropdown values
     * @property {Boolean} preselectedValues=[] preselected values
     * @property {Boolean} numOfOptions=10 number of entries displayed
     * @property {Boolean} isMultiple=true dropdown multiple
     */
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
            valueList.forEach(function (obj) {
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
            valueList.forEach(function (value) {
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
     * removes all value-models from collection and calls addValueModel for each new value
     * @param {string[]} newValueList - new dropdown values
     * @param {string[]} preselectedValues - new preselected values
     * @returns {void}
     */
    replaceValueModels: function (newValueList, preselectedValues) {
        this.get("valuesCollection").reset();
        newValueList.forEach(function (value) {
            this.addValueModel(value);
        }, this);
        this.set("preselectedValues", preselectedValues);
        if (preselectedValues.length > 0) {
            this.updateSelectedValues(preselectedValues);
        }
        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        this.trigger("render");
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
        const collection = this.get("valuesCollection").models;

        collection.forEach(function (model) {
            model.set("isSelectable", true);
        }, this);
    },

    /**
     * updateCollection
     * @param  {array} value - selected value
     * @return {void}
     */
    updateValues: function (value) {
        const collection = this.get("valuesCollection").models;

        collection.forEach((model, index) => {
            model.set("value", value[index]);
            model.set("displayName", value[index]);
        });
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
        let vals = values;

        if (!Array.isArray(values)) {
            if (!this.get("isMultiple")) {
                this.setDisplayName(values);
            }
            vals = [vals];
        }
        this.get("valuesCollection").models.forEach(valueModel => {
            if (vals.includes(valueModel.get("value"))) {
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
            if (!values.includes(valueModel.get("value")) && !valueModel.get("isSelected")) {
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
            const groupedModels = Radio.request("Util", "groupBy", models, function (model) {
                return model.get("group");
            });

            this.set("valueModelsToShow", groupedModels);
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
        const selectedModels = this.get("valuesCollection").where({isSelected: true}),
            obj = {
                attrName: this.get("name"),
                type: this.get("type"),
                values: []
            };

        if (selectedModels.length > 0) {
            selectedModels.forEach(model => {
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
