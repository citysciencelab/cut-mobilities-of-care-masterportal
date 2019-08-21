import SnippetModel from "../model";
import ValueModel from "../value/model";
import moment from "moment";

const DatepickerModel = SnippetModel.extend(/** @lends DatepickerModel.prototype */{
    /**
     * @class DatepickerModel
     * @extends SnippetModel
     * @memberof Snippets.Datepicker
     * @constructs
     * @property {Date} preselectedValue Initial value.
     * @property {Date} startDate earliest selectable date
     * @property {Date} endDate latest selectable date
     * @param {object} model Model to be used in this view
     */
    defaults: _.extend({}, SnippetModel.prototype.defaults, {
        preselectedValue: null
    }),

    /**
     * Sets default values and listener
     * @param   {Backbone.Model} model Model attributes to be used in this view
     * @returns {void}
     */
    initialize: function (model) {
        const startDate = model.startDate,
            endDate = model.endDate,
            selectedDate = model.preselectedValue ? model.preselectedValue : moment().toDate();

        this.superInitialize();
        this.addValueModel(selectedDate, startDate, endDate);
        this.listenTo(this.get("valuesCollection"), {
            "change:date": function (valueModel, value) {
                this.triggerValuesChanged(model, value);
            }
        });
    },

    /**
     * Add Model to valuesCollection representing the choosen date
     * @param {Date} value the preselectedValue Date
     * @param {Date} startDate earliest selectable date
     * @param {Date} endDate latest selectable date
     * @returns {void}
     */
    addValueModel: function (value, startDate, endDate) {
        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            date: value,
            startDate: startDate,
            endDate: endDate,
            type: this.get("type")
        }));
    },

    /**
     * Call the updateValueModel function
     * trigger the valueChanged event on snippetCollection in queryModel
     * @param  {Date} snippetValue new selected date
     * @returns {void}
     */
    updateValues: function (snippetValue) {
        this.get("valuesCollection").at(0).set("date", snippetValue);
    },

    /**
     * Update the internal valuesCollection silently and triggers event to adjust the DOM element
     * @param  {Date} value new selected date
     * @returns {void}
     */
    updateValuesSilently: function (value) {
        this.get("valuesCollection").at(0).set("date", value, {silent: true});
        this.trigger("updateDOMSlider", value);
    },

    /**
     * Returns an object with the datepicker name and its date
     * @return {object} - contains the selected values
     */
    getSelectedValues: function () {
        return {
            attrName: this.get("name"),
            type: this.get("type"),
            values: this.get("valuesCollection").pluck("date")
        };
    }
});

export default DatepickerModel;
