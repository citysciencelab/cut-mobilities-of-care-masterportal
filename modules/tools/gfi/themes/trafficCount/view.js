import ThemeView from "../view";
import TrafficCountTemplate from "text-loader!./template.html";
import SnippetDatepickerView from "../../../../snippets/datepicker/view";
import moment from "moment";

const TrafficCountView = ThemeView.extend(/** @lends TrafficCountView.prototype */{
    events: {
        "shown.bs.tab": "toggleTab",
        "remove": "destroy",
        "click .btn": "toggleCalendar"
    },

    /**
    * @class TrafficCountView
    * @memberof Tools.GFI.Themes.TrafficCount
    * @constructs
    */
    initialize: function () {
        // call ThemeView's initialize method explicitly
        ThemeView.prototype.initialize.apply(this);

        this.listenTo(this.model, {
            "change:title": this.renderTitle,
            "change:type": this.renderType,
            "change:meansOfTransport": this.renderMeansOfTransport,
            "change:lastUpdate": this.renderLastUpdate,
            "change:totalDesc": this.renderTotalDesc,
            "change:totalValue": this.renderTotalValue,
            "change:thisYearDesc": this.renderThisYearDesc,
            "change:thisYearValue": this.renderThisYearValue,
            "change:lastYearDesc": this.renderLastYearDesc,
            "change:lastYearValue": this.renderLastYearValue,
            "change:lastDayDesc": this.renderLastDayDesc,
            "change:lastDayValue": this.renderLastDayValue,
            "change:highestWorkloadDayDesc": this.renderHighestWorkloadDayDesc,
            "change:highestWorkloadDayValue": this.renderHighestWorkloadDayValue,
            "change:highestWorkloadWeekDesc": this.renderHighestWorkloadWeekDesc,
            "change:highestWorkloadWeekValue": this.renderHighestWorkloadWeekValue,
            "change:highestWorkloadMonthDesc": this.renderHighestWorkloadMonthDesc,
            "change:highestWorkloadMonthValue": this.renderHighestWorkloadMonthValue,
            "renderDayDatepicker": this.renderDayDatepicker,
            "renderWeekDatepicker": this.renderWeekDatepicker,
            "renderYearDatepicker": this.renderYearDatepicker
        });
    },
    tagName: "div",
    className: "trafficCount",

    /**
     * @member TrafficCountTemplate
     * @description Template used to create the trafficCount gfi.
     * @memberof Tools.GFI.Themes.TrafficCount
     */
    template: _.template(TrafficCountTemplate),

    /**
     * react to toggle of tab
     * @param {Object} evt the toggle event with evt.currentTarget the choosen tabs dom element
     * @returns {Void}  -
     */
    toggleTab: function (evt) {
        const value = $(evt.target).parent().attr("value");

        this.resize();
        this.model.toggleTab(value);
    },

    /**
     * Detached gfi are opened on the right side so a resize might throw them out of of the map view. This method pulls the left coordinate to fit the gfi on the screen.
     * @fires Core#RadioRequestUtilIsViewMobile
     * @returns {void}
     */
    resize: function () {
        if (this.gfiWindow === "detached" && !Radio.request("Util", "isViewMobile")) {
            const gfiWidth = this.$el.width(),
                mapWidth = $("#map").width() - 40,
                gfiLeft = parseInt(this.$el.offsetParent().css("left"), 10),
                gfiRight = gfiLeft + gfiWidth,
                newLeft = gfiLeft - (gfiRight - mapWidth);

            if (gfiRight > mapWidth) {
                this.$el.offsetParent().css("left", newLeft + "px");
            }
        }
    },

    /**
     * render title
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderTitle: function (model, value) {
        this.$el.find("#title").text(value);
    },

    /**
     * render type
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderType: function (model, value) {
        this.$el.find("#type").text(value);
    },

    /**
     * render meansOfTransport
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderMeansOfTransport: function (model, value) {
        this.$el.find("#meansOfTransport").text(value);
    },

    /**
     * render totalDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderTotalDesc: function (model, value) {
        this.$el.find("#totalDesc").text(value);
    },
    /**
     * render totalValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderTotalValue: function (model, value) {
        this.$el.find("#totalValue").text(value);
    },

    /**
     * render thisYearDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderThisYearDesc: function (model, value) {
        this.$el.find("#thisYearDesc").text(value);
    },
    /**
     * render thisYearValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderThisYearValue: function (model, value) {
        this.$el.find("#thisYearValue").text(value);
    },

    /**
     * render lastYearDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderLastYearDesc: function (model, value) {
        this.$el.find("#lastYearDesc").text(value);
    },
    /**
     * render lastYearValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderLastYearValue: function (model, value) {
        this.$el.find("#lastYearValue").text(value);
    },

    /**
     * render lastDayDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderLastDayDesc: function (model, value) {
        this.$el.find("#lastDayDesc").text(value);
    },
    /**
     * render lastDayValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderLastDayValue: function (model, value) {
        this.$el.find("#lastDayValue").text(value);
    },

    /**
     * render highestWorkloadDayDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderHighestWorkloadDayDesc: function (model, value) {
        this.$el.find("#highestWorkloadDayDesc").text(value);
    },
    /**
     * render highestWorkloadDayValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderHighestWorkloadDayValue: function (model, value) {
        this.$el.find("#highestWorkloadDayValue").text(value);
    },

    /**
     * render highestWorkloadWeekDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderHighestWorkloadWeekDesc: function (model, value) {
        this.$el.find("#highestWorkloadWeekDesc").text(value);
    },
    /**
     * render highestWorkloadWeekValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderHighestWorkloadWeekValue: function (model, value) {
        this.$el.find("#highestWorkloadWeekValue").text(value);
    },

    /**
     * render highestWorkloadMonthDesc
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderHighestWorkloadMonthDesc: function (model, value) {
        this.$el.find("#highestWorkloadMonthDesc").text(value);
    },
    /**
     * render highestWorkloadMonthValue
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderHighestWorkloadMonthValue: function (model, value) {
        this.$el.find("#highestWorkloadMonthValue").text(value);
    },

    /**
     * render lastUpdate
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderLastUpdate: function (model, value) {
        this.$el.find("#lastUpdate").text(value);
    },

    renderDayDatepicker: function () {
        this.$el.find("#dayDateSelector").append(new SnippetDatepickerView({model: this.model.get("dayDatepicker")}).render().el);
        this.model.get("dayDatepicker").updateValues(moment().toDate());
    },

    renderWeekDatepicker: function () {
        this.$el.find("#weekDateSelector").append(new SnippetDatepickerView({model: this.model.get("weekDatepicker")}).render().el);
        this.model.get("weekDatepicker").updateValues(moment().toDate());
    },

    renderYearDatepicker: function () {
        this.$el.find("#yearDateSelector").append(new SnippetDatepickerView({model: this.model.get("yearDatepicker")}).render().el);
        this.model.get("yearDatepicker").updateValues(moment().startOf("year").toDate());
    },

    /**
     * opens the calender
     * @param   {Event} evt click event
     * @returns {void}
     */
    toggleCalendar: function (evt) {
        const input = this.$el.find(evt.currentTarget).parents(".input-group").find("input");

        input.focus();
    },

    destroy: function () {
        this.model.onIsVisibleEvent(null, false);
    }
});

export default TrafficCountView;
