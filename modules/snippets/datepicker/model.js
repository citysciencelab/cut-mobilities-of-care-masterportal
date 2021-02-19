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
     * @property {(Boolean|Number)} multidate Enable multidate picking
     * @property {Boolean} selectWeek Enable week picking
     * @property {Boolean} readOnly the input from the datepicker is read only or not
     * @property {Date} startDate earliest selectable date
     * @property {Date} endDate latest selectable date
     * @param {object} attributes Model attributes to be used in this view
     */
    defaults: Object.assign({}, SnippetModel.prototype.defaults, {
        preselectedValue: null,
        multidate: false,
        selectWeek: false,
        readOnly: true
    }),

    /**
     * Sets default values and listener
     * @param   {Object} attributes to be used in this view
     * @returns {void}
     */
    initialize: function (attributes) {
        this.superInitialize();

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang(i18next.language);
        this.addValueModel(attributes);
        this.listenTo(this.get("valuesCollection"), {
            "change:date": function (model, value) {
                if (Array.isArray(value)) {
                    this.triggerValuesChanged(model, value);
                }
                else {
                    this.triggerValuesChanged(model, [value]);
                }
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
            "currentLng": lng
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
            multidate: this.get("multidate"),
            date: model.preselectedValue ? model.preselectedValue : moment().toDate(),
            startDate: model.startDate,
            endDate: model.endDate,
            inputs: model.inputs ? model.inputs : undefined,
            minViewMode: model.minViewMode ? model.minViewMode : "days",
            maxViewMode: model.maxViewMode ? model.maxViewMode : "days",
            calendarWeeks: model.calendarWeeks ? model.calendarWeeks : false,
            format: model.format ? model.format : "dd.mm.yyyy",
            autoclose: model.autoclose ? model.autoclose : false,
            weekStart: model.weekStart ? model.weekStart : 1,
            type: this.get("type"),
            todayHighlight: model.todayHighlight ? model.todayHighlight : false,
            language: this.currentLng ? this.currentLng : i18next.language
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
            values: this.get("valuesCollection").at(0).get("date")
        };
    },

    /**
     * remove dates if they are in the same week
     * @param {Date[]} dates - selected days
     * @returns {Date[]} dates - dates displayed in the week datepicker
     */
    getDatesForWeekPicker: function (dates) {
        const startingDaysOfWeek = [],
            indexOfDuplicates = [];

        // get all week starting days per date
        dates.forEach(date => {
            startingDaysOfWeek.push(moment(date).startOf("isoWeek").format("YYYY-MM-DD"));
        });

        // find the index of the starting dates that exist twice
        startingDaysOfWeek.forEach((startingDay, index) => {
            if (startingDaysOfWeek.lastIndexOf(startingDay) !== index) {
                indexOfDuplicates.push(startingDaysOfWeek.lastIndexOf(startingDay));
                indexOfDuplicates.push(startingDaysOfWeek.indexOf(startingDay));
            }
        });

        // remove all dates of the same week from back to front
        indexOfDuplicates.sort().reverse().forEach(duplicate => {
            dates.splice(duplicate, 1);
        });

        return dates;
    }
});

export default DatepickerModel;
