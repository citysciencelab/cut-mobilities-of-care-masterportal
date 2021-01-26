import SnippetModel from "../model";
import ValueModel from "./valueModel";
import moment from "moment";

const SliderModel = SnippetModel.extend(/** @lends SliderModel.prototype */{
    defaults: Object.assign({}, SnippetModel.prototype.defaults, {
        editableValueBox: true,
        step: 1,
        preselectedValues: null,
        precision: 3,
        selection: "before",
        displayName: undefined,
        ticks: [],
        withLabel: true,
        errorMessage: "Text",
        // translations:
        incorrectEntry: "",
        from: "",
        to: ""
    }),

    /**
     * @class SliderModel
     * @extends SnippetModel
     * @memberof Snippets.Slider
     * @constructs
     * @property {boolean} editableValueBox=true Flag to show input or label
     * @property {number} step=1 Increment step of the slider
     * @property {number | number[]} [preselectedValues] Initial value. Use array to have a range slider.
     * @property {number} precision=3 The number of digits shown after the decimal.
     * @property {string} selection=before Selection placement. Accepts: 'before', 'after' or 'none'. In case of a range slider, the selection will be placed between the handles
     * @property {string} displayName=display name of the snippet
     * @property {ticks} ticks=slider ticks
     * @property {boolean} withLabel=true Flag to show label
     * @param {object} attributes Model to be used in this view
     * @fires Util#RadioRequestUtilSort
     * @listens Alerting#RadioTriggerAlertAlert
     */
    initialize: function (attributes) {
        const parsedValues = this.parseValues(attributes.values);

        // parent (SnippetModel) initialize
        this.superInitialize();
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang(i18next.language);
        this.addValueModels(Math.min(...parsedValues), Math.max(...parsedValues));
        if (this.get("preselectedValues") !== null) {
            this.updateValues(this.get("preselectedValues"));
        }
        this.listenTo(this.get("valuesCollection"), {
            "change:value": function (model, value) {
                this.triggerValuesChanged(model, value);
            },
            "updateDOMSlider": function () {
                this.trigger("updateDOMSlider", this.getSelectedValues().values);
            },
            "updateValue": function (value) {
                this.updateValues(value);
            }
        });
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "incorrectEntry": i18next.t("common:snippets.slider.incorrectEntry"),
            "from": i18next.t("common:snippets.slider.from"),
            "to": i18next.t("common:snippets.slider.to"),
            "currentLng": lng
        });
    },

    /**
     * Add minValueModel and maxValueModel to valuesCollection
     * @param {number} min min
     * @param {number} max max
     * @returns {void}
     */
    addValueModels: function (min, max) {
        this.get("valuesCollection").add([
            new ValueModel({
                attr: this.get("name"),
                displayName: this.get("displayName") + this.get("from"),
                value: min,
                type: this.get("type"),
                isMin: true
            }),
            new ValueModel({
                attr: this.get("name"),
                displayName: this.get("displayName") + this.get("to"),
                value: max,
                type: this.get("type"),
                isMin: false
            })
        ]);
    },

    /**
     * Update the internal valuesCollection and triggers event to adjust the DOM element
     * triggers also the valueChanged event on snippetCollection in queryModel
     * @param  {number | array} snippetValues - depending on slider type
     * @returns {void}
     */
    updateValues: function (snippetValues) {
        // range slider
        if (Array.isArray(snippetValues)) {
            this.get("valuesCollection").at(0).setValue(snippetValues[0]);
            this.get("valuesCollection").at(1).setValue(snippetValues[1]);
        }
        // slider
        else {
            this.get("valuesCollection").at(0).setValue(snippetValues);
        }
        this.trigger("updateDOMSlider", snippetValues);
    },

    /**
     * Update the internal valuesCollection silently and triggers event to adjust the DOM element
     * @param  {number | array} snippetValues - depending on slider type
     * @returns {void}
     */
    updateValuesSilently: function (snippetValues) {
        // range slider
        if (Array.isArray(snippetValues)) {
            this.get("valuesCollection").at(0).set("value", snippetValues[0], {silent: true});
            this.get("valuesCollection").at(1).set("value", snippetValues[1], {silent: true});
        }
        // slider
        else {
            this.get("valuesCollection").at(0).set("value", snippetValues, {silent: true});
        }
        this.trigger("updateDOMSlider", snippetValues);
    },

    /**
     * Returns an object with the slider name and its values
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
     * Parse strings into numbers if necessary
     * @param  {string[]} [valueList=[]] valueList
     * @return {number[]} parsedValueList
     */
    parseValues: function (valueList = []) {
        const parsedValueList = [];

        valueList.forEach(value => {
            let val = value;

            if (typeof val === "string") {
                val = parseInt(val, 10);
            }
            parsedValueList.push(val);
        });

        return parsedValueList;
    },

    /**
     * Change the values by input from inputfields. Render change if enter is pressed
     * @fires Util#RadioRequestUtilSort
     * @param {number} minValue - input value min
     * @param {number} maxValue - input value max
     * @returns {void}
     */
    changeValuesByText: function (minValue, maxValue) {
        const initValues = this.get("valuesCollection").pluck("initValue"),
            type = this.getSelectedValues().type;
        let min = minValue,
            max = maxValue,
            values,
            lastValues;

        // check if input is allowed
        if (min === "" && max !== "") {
            max = this.checkInvalidInput(this.parseValueToNumber(max, type), initValues[1]);
            min = initValues[0];
        }
        else if (min !== "" && max === "") {
            min = this.checkInvalidInput(this.parseValueToNumber(min, type), initValues[0]);
            max = initValues[1];
        }
        else {
            lastValues = this.get("valuesCollection").pluck("value");

            min = this.checkInvalidInput(this.parseValueToNumber(min, type), lastValues[0]);
            max = this.checkInvalidInput(this.parseValueToNumber(max, type), lastValues[1]);
        }

        values = [min, max];
        values = Radio.request("Util", "sort", "", values);

        this.updateValues(values);

        return values;
    },

    /**
     * Converts number to integer or decimal by type.
     * @param {number} inputValue - input value
     * @param {String} type - input type
     * @returns {void} value
    */
    parseValueToNumber: function (inputValue, type) {
        let value = inputValue === undefined ? NaN : inputValue;

        if (type === "integer") {
            value = parseInt(value, 10);
        }
        else if (type === "decimal") {
            value = parseFloat(value);
        }
        else {
            value = NaN;
        }

        return value;
    },

    /**
    * Check if value is valid parameter or set value to initValue
    * @param {number} value - input value
    * @param {number} otherValue - value that be set if param value NaN
    * @returns {number} val
    */
    checkInvalidInput: function (value, otherValue) {
        let val = value;

        if (isNaN(val)) {
            val = otherValue;
            this.errorMessage();
        }

        return val;
    },

    /**
     * Returns an error message for invalid inputs
     * @listens Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    errorMessage: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>" + this.get("incorrectEntry") + "</strong>",
            kategorie: "alert-danger"
        });
    },

    /**
     * Returns a parsed string of the given value according to the slider type.
     * Only used with editableValueBox=true.
     * @param   {number} value Value to be parsed
     * @returns {string} text Beautified text of the value according to it's type.
     */
    getValueText: function (value) {
        const type = this.get("type");

        if (type === "time") {
            return moment(value).format("HH:mm");
        }
        else if (type === "date") {
            return moment(value).locale(this.get("currentLng")).format("D. MMMM YYYY");
        }
        return value.toString();
    },

    /**
     * Checks whether all values lies within a specified range.
     * @param {number[]} [values=[]] - Values to be checked.
     * @param {number} [min=0] - Min value in range.
     * @param {number} [max=99999] - Max value in range.
     * @returns {boolean} isInrange - Are all values in range.
     */
    checkAreAllValuesInRange: function (values = [], min = 0, max = 99999) {
        let allValuesInRange = true;

        values.forEach(value => {
            if (allValuesInRange && value < min || value > max) {
                allValuesInRange = false;
            }
        });

        return allValuesInRange;
    },

    /**
     * Setter for defaultWidth.
     * @param {number} value - The default width.
     * @returns {void}
     */
    setDefaultWidth: function (value) {
        this.set("defaultWidth", value);
    }
});

export default SliderModel;
