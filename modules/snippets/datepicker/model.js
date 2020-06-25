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
    defaults: Object.assign({}, SnippetModel.prototype.defaults, {
        preselectedValue: null
    }),

    /**
     * Sets default values and listener
     * @param   {Backbone.Model} model Model attributes to be used in this view
     * @returns {void}
     */
    initialize: function (model) {
        this.superInitialize();
        this.addValueModel(model);
        this.listenTo(this.get("valuesCollection"), {
            "change:date": function (valueModel, value) {
                this.triggerValuesChanged(model, value);
                this.trigger("updateDOM", value);
            }
        });
    },

    /**
     * Add Model to valuesCollection representing the choosen date. Most parameter are values of bootstrap.datepicker.
     * @see https://bootstrap-datepicker.readthedocs.io/en/latest/
     * @param {object} model the preselectedValue Date
     * @returns {void}
     */
    addValueModel: function (model) {
        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            date: model.preselectedValue ? model.preselectedValue : moment().toDate(),
            startDate: model.startDate,
            endDate: model.endDate,
            inputs: model.inputs ? model.inputs : undefined,
            minViewMode: model.minViewMode ? model.minViewMode : "days",
            maxViewMode: model.maxViewMode ? model.maxViewMode : "days",
            calendarWeeks: model.calendarWeeks ? model.calendarWeeks : false,
            format: model.format ? model.format : "dd.mm.yyyy",
            autoclose: model.autoclose ? model.autoclose : false,
            type: this.get("type"),
            todayHighlight: model.todayHighlight ? model.todayHighlight : false,
            selectWeek: model.selectWeek ? model.selectWeek : false,
            language: model.language ? model.language : "de"
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
        this.trigger("updateDOM", value);
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
