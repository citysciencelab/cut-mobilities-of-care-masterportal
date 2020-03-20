import Template from "text-loader!./template.html";
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

    /**
     * Setting listener
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "updateDOM": this.updateDOM,
            "removeView": this.remove
        }, this);
    },
    template: _.template(Template),

    /**
     * render methode
     * @returns {this} this
     */
    render: function () {
        this.$el.html(this.template());
        this.initDatepicker();
        this.delegateEvents();
        return this;
    },

    /**
     * init the datepicker. no template needed.
     * @returns {void}
     */
    initDatepicker: function () {
        const date = this.model.get("valuesCollection").models[0],
            datepickerContainer = this.$el.find(".datepicker-container");

        datepickerContainer.datepicker({
            todayHighlight: date.get("todayHighlight"),
            language: date.get("language"),
            defaultViewDate: date.get("date"),
            startDate: date.get("startDate"),
            endDate: date.get("endDate"),
            minViewMode: date.get("minViewMode"),
            maxViewMode: date.get("maxViewMode"),
            inputs: date.get("inputs"),
            calendarWeeks: date.get("calendarWeeks"),
            format: date.get("format"),
            autoclose: date.get("autoclose"),
            templates: {
                leftArrow: "<i class=\"glyphicon glyphicon-triangle-left\"></i>",
                rightArrow: "<i class=\"glyphicon glyphicon-triangle-right\"></i>"
            }
        });

        // datepicker with target 'inputs' need listener on changeDate in order to set valuesCollection
        if (date.get("inputs")) {
            // eslint-disable-next-line
            date.get("inputs").on("changeDate", this.changeDate.bind(this));

            // listener to set classes for selectWeek
            if (date.get("selectWeek")) {
                // eslint-disable-next-line
                date.get("inputs").on("show", this.showWeekpicker.bind(this));
            }
        }

        // setter for target 'inline'
        datepickerContainer.datepicker("setDate", date.get("date"));
    },

    /**
     * Is triggered when the selected date of the datepicker changes. Sets value to the model.
     * @param   {evt} evt Event fired by the datepicker
     * @returns {void}
     */
    changeDate: function (evt) {
        const newDate = evt.date;

        this.model.updateValues(newDate);
    },

    /**
     * Sets the datepicker value after the external model has changed.
     * Using different methods depending on render target.
     * @param   {Date} value new Date value
     * @returns {void}
     */
    updateDOM: function (value) {
        const inputs = this.model.get("valuesCollection").at(0).get("inputs");

        if (inputs) {
            inputs.datepicker("update", value);

            return;
        }

        this.$el.find(".datepicker-container").datepicker("update", value);
    },

    /**
     * Sets classes to the rendered DOM element for weeks instead of days
     * @returns {void}
     */
    showWeekpicker: function () {
        const weekList = $(".datepicker-dropdown .datepicker-days table tbody tr"),
            activeWeekList = weekList.find("td.active.day").parent();

        weekList.mouseover(function () {
            $(this).addClass("week");
        });
        weekList.mouseout(function () {
            $(this).removeClass("week");
        });
        // remove all active class
        weekList.removeClass("week-active");

        // add active class
        activeWeekList.addClass("week-active");
    }
});

export default DatepickerView;
