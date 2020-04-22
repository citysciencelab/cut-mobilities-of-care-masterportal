import ThemeView from "../view";
import TrafficCountTemplate from "text-loader!./template.html";
import SnippetDatepickerView from "../../../../snippets/datepicker/view";
import moment from "moment";

const TrafficCountView = ThemeView.extend(/** @lends TrafficCountView.prototype */{
    events: {
        "shown.bs.tab": "toggleTab",
        "remove": "destroy",
        "click .btn": "toggleCalendar",
        "change input.form-check-input": "toggleTableDiagram"
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
            "change:dayTableContent": this.renderDayTableContent,
            "change:weekTableContent": this.renderWeekTableContent,
            "change:yearTableContent": this.renderYearTableContent,
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
        this.setCurrentTabClassFooter(value);
        this.setContentScrollbar(value);
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

    /** Setting the overflow dynamically to make sure there is no scrollbar to show if the content is not out of the range of the gfi fenster (there is a bug in firefox and IE)
     * @param {String} value element value
     * @returns {Void}  -
     */
    setContentScrollbar: function (value) {
        if (this.gfiWindow === "detached" && !Radio.request("Util", "isViewMobile")) {
            const contentheight = $(".trafficCount").height(),
                contentMaxheight = $(".gfi-content").height();

            if (value === "infos") {
                if (contentheight <= contentMaxheight) {
                    $(".gfi-content").css("overflow", "hidden");
                }
            }
            else {
                $(".gfi-content").css("overflow", "auto");
            }
        }
    },

    /**
     * adding the class dynamically into the bottom for current tab
     * @param   {String} value element value
     * @returns {Void}  -
     */
    setCurrentTabClassFooter: function (value) {
        this.$el.find(".tab-bottom").removeClass().addClass("tab-bottom " + value);
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
     * creates HTML-Code for dayTableHeader
     * @return {String} HTML
     */
    createDayTableHeader: function () {
        const dayTableHeaderArr = this.model.get("dayTableContent").day.headerArr;
        let dayTableHeaderHtml = "";

        if (dayTableHeaderArr !== undefined) {
            dayTableHeaderHtml += "<th class=\"tableTopLeft\">" + this.model.get("dayTableContent").day.title + "</th>";
            if (Array.isArray(dayTableHeaderArr) && dayTableHeaderArr.length > 0) {
                for (const key in dayTableHeaderArr) {
                    dayTableHeaderHtml += "<th class=\"tableColumn\">" + dayTableHeaderArr[key] + " <br/>Uhr</th>";
                }
            }
        }

        return dayTableHeaderHtml;
    },

    /**
     * Create HTML-Code for table
     * @param   {string[]} tableColumnsArr Array of table headers
     * @param   {string} firstColumn     text of first column
     * @param   {string} headerPrefix    text to prefix column
     * @param   {string} headerSuffix    test to suffix column
     * @returns {string} html snippet
     */
    createTableContent: function (tableColumnsArr, firstColumn, headerPrefix, headerSuffix) {
        let tableColumnsHtml = "";

        if (tableColumnsArr === undefined) {
            return "";
        }
        tableColumnsHtml += "<td class=\"tableFirstColumn\">" + headerPrefix + firstColumn + headerSuffix + "</td>";
        if (Array.isArray(tableColumnsArr) && tableColumnsArr.length > 0) {
            for (const key in tableColumnsArr) {
                tableColumnsHtml += "<td class=\"text-align-center\">" + tableColumnsArr[key] + "</td>";
            }
        }

        return tableColumnsHtml;
    },

    /**
     * creates HTML-Code for weekTableHeader
     * @return {String} HTML
     */
    createWeekTableHeader: function () {
        const weekTableHeaderDateArr = this.model.get("weekTableContent").week.headerDateArr,
            weekTableHeaderHourArr = this.model.get("weekTableContent").week.headerHourArr;

        let weekTableHeaderHtml = "";

        if (weekTableHeaderDateArr !== undefined) {
            if (Array.isArray(weekTableHeaderDateArr) && weekTableHeaderDateArr.length > 0 &&
                Array.isArray(weekTableHeaderHourArr) && weekTableHeaderHourArr.length > 0 &&
                weekTableHeaderDateArr.length === weekTableHeaderHourArr.length) {

                weekTableHeaderHtml += "<th class=\"tableTopLeft\">" + this.model.get("weekTableContent").week.title + "</th>";
                for (let i = 0; i < weekTableHeaderDateArr.length; i++) {
                    weekTableHeaderHtml += "<th class=\"tableColumn\">" + weekTableHeaderDateArr[i] + "<br/>" + weekTableHeaderHourArr[i] + " Uhr</th>";
                }
            }
        }

        return weekTableHeaderHtml;
    },

    /**
     * creates HTML-Code for yearTableHeader
     * @return {String} HTML
     */
    createYearTableHeader: function () {
        const yearTableHeaderArr = this.model.get("yearTableContent").year.headerArr;
        let yearTableHeaderHtml = "";

        if (yearTableHeaderArr) {
            yearTableHeaderHtml += "<th class=\"tableTopLeft\">" + this.model.get("yearTableContent").year.title + "</th>";
            if (Array.isArray(yearTableHeaderArr) && yearTableHeaderArr.length > 0) {
                for (const key in yearTableHeaderArr) {
                    yearTableHeaderHtml += "<th class=\"tableColumn\">KW " + yearTableHeaderArr[key] + "</th>";
                }
            }
        }

        return yearTableHeaderHtml;
    },

    /**
     * appends header and columns to day table
     * @returns {Void}  -
     */
    renderDayTableContent: function () {
        const carsArr = this.model.get("dayTableContent").day.carsArr,
            bicyclesArr = this.model.get("dayTableContent").day.bicyclesArr,
            trucksArr = this.model.get("dayTableContent").day.trucksArr,
            firstColumn = this.model.get("dayTableContent").day.firstColumn;

        this.$el.find("#dayTableContentHeader").empty();
        this.$el.find("#dayTableContentCars").empty();
        this.$el.find("#dayTableContentTrucks").empty();
        this.$el.find("#dayTableContentBicycles").empty();

        this.$el.find("#dayTableContentHeader").append(this.createDayTableHeader());
        this.$el.find("#dayTableContentCars").append(this.createTableContent(carsArr, firstColumn, "", " KFZ abs."));
        this.$el.find("#dayTableContentTrucks").append(this.createTableContent(trucksArr, firstColumn, "", " SV-Anteil in %"));
        this.$el.find("#dayTableContentBicycles").append(this.createTableContent(bicyclesArr, firstColumn, "", ""));
    },

    /**
     * appends header and columns to week table
     * @returns {Void}  -
     */
    renderWeekTableContent: function () {
        const bicyclesArr = this.model.get("weekTableContent").week.bicyclesArr,
            trucksArr = this.model.get("weekTableContent").week.trucksArr,
            carsArr = this.model.get("weekTableContent").week.carsArr,
            firstColumn = this.model.get("weekTableContent").week.firstColumn;

        this.$el.find("#weekTableContentHeader").empty();
        this.$el.find("#weekTableContentCars").empty();
        this.$el.find("#weekTableContentTrucks").empty();
        this.$el.find("#weekTableContentBicycles").empty();

        this.$el.find("#weekTableContentHeader").append(this.createWeekTableHeader());
        this.$el.find("#weekTableContentCars").append(this.createTableContent(carsArr, firstColumn, "KW ", " KFZ abs."));
        this.$el.find("#weekTableContentTrucks").append(this.createTableContent(trucksArr, firstColumn, "KW ", " SV-Anteil in %"));
        this.$el.find("#weekTableContentBicycles").append(this.createTableContent(bicyclesArr, firstColumn, "KW ", ""));
    },

    /**
     * appends header and columns to year table
     * @returns {Void}  -
     */
    renderYearTableContent: function () {
        const carsArr = this.model.get("yearTableContent").year.carsArr,
            firstColumn = this.model.get("yearTableContent").year.firstColumn,
            trucksArr = this.model.get("yearTableContent").year.trucksArr,
            bicyclesArr = this.model.get("yearTableContent").year.bicyclesArr;

        this.$el.find("#yearTableContentHeader").empty();
        this.$el.find("#yearTableContentCars").empty();
        this.$el.find("#yearTableContentTrucks").empty();
        this.$el.find("#yearTableContentBicycles").empty();

        this.$el.find("#yearTableContentHeader").append(this.createYearTableHeader());
        this.$el.find("#yearTableContentCars").append(this.createTableContent(carsArr, firstColumn, "", " KFZ abs."));
        this.$el.find("#yearTableContentTrucks").append(this.createTableContent(trucksArr, firstColumn, "", " SV-Anteil in %"));
        this.$el.find("#yearTableContentBicycles").append(this.createTableContent(bicyclesArr, firstColumn, "", ""));
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

    /**
     * Showing the table or diagram with checkbox value
     * @param   {Event} evt click event
     * @returns {void}
     */
    toggleTableDiagram: function (evt) {
        const inputId = evt.target.id,
            currentTab = inputId.split("-")[1];
        let toggledElementId;

        if (inputId.includes("table")) {
            toggledElementId = "#table" + currentTab;
        }
        else if (inputId.includes("diagram")) {
            toggledElementId = "#diagram" + currentTab;
        }

        if (this.$(evt.target).prop("checked")) {
            this.$el.find($(toggledElementId)).removeClass("inactive");
        }
        else {
            this.$el.find($(toggledElementId)).addClass("inactive");
        }
    },

    destroy: function () {
        this.model.onIsVisibleEvent(null, false);
    }
});

export default TrafficCountView;
