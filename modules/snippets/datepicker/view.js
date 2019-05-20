import "bootstrap-datepicker";
import "bootstrap-datepicker/dist/locales/bootstrap-datepicker.de.min";

const DatepickerView = Backbone.View.extend(/** @lends DatepickerView.prototype */{
    /**
     * @class DatepickerView
     * @extends Backbone.View
     * @memberof Snippets.Datepicker
     * @constructs
     */
    events: {
        "changeDate": "changeDate"
    },

    className: "datepicker-container",

    /**
     * render methode
     * @returns {this} this
     */
    render: function () {
        this.$el.html();
        this.initDatepicker();
        this.delegateEvents();
        return this;
    },

    /**
     * init the datepicker. no template needed.
     * @returns {void}
     */
    initDatepicker: function () {
        const date = this.model.get("valuesCollection").models[0];

        this.$el.datepicker({
            todayHighlight: true,
            language: "de",
            defaultViewDate: date.get("date"),
            startDate: date.get("startDate"),
            endDate: date.get("endDate")
        });
    },

    /**
     * Gets triggered when the selected date of the datepicker changes and sends info to model
     * @param   {evt} evt Event fired by the datepicker
     * @returns {void}
     */
    changeDate: function (evt) {
        const newDate = evt.date;

        this.model.updateValues(newDate);
    }
});

export default DatepickerView;
