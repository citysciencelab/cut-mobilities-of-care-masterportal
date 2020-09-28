import ThemeView from "../view";
import TrafficCountTemplate from "text-loader!./template.html";
import SnippetDatepickerView from "../../../../snippets/datepicker/view";
import ExportButtonView from "../../../../snippets/exportButton/view";

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
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});

        // call ThemeView's initialize method explicitly
        ThemeView.prototype.initialize.apply(this);

        this.listenTo(this.model, {
            "change:currentLng": this.render,
            "change:title": this.renderTitle,
            "change:type": this.renderType,
            "change:meansOfTransport": this.renderMeansOfTransport,
            "change:direction": this.renderDirection,
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
        this.render();
    },
    tagName: "div",
    className: "trafficCount",

    /**
     * renders the view
     * @param {TrafficCountModel} model the model of the view
     * @param {Boolean} value the values of the changes made to the model
     * @returns {Void}  -
     */
    render: function () {
        this.model.set("dayDatepicker", null);
        this.model.set("weekDatepicker", null);
        this.model.set("yearDatepicker", null);
        this.model.set("dayTableContent", []);
        this.model.set("weekTableContent", []);
        this.model.set("yearTableContent", []);

        const template = _.template(TrafficCountTemplate),
            params = this.model.toJSON();

        this.$el.html(template(params));
        return this;
    },

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
        this.model.set("tabValue", value);
        this.renderExportButton(value);
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
                newLeft = gfiLeft - (gfiRight - mapWidth) - 40;

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

    renderExportButton: function (value) {
        if (value !== "infos") {
            this.$el.find(".tab-bottom").append(this.exportButtonView.render().el);
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
     * render direction
     * @param   {Object} model containing model
     * @param   {String} value element value
     * @returns {Void}  -
     */
    renderDirection: function (model, value) {
        this.$el.find("#direction").text(value);
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
     * @param {String} title - title of the table
     * @return {String} HTML
     */
    createDayTableHeader: function (title) {
        const headerArray = this.model.getXAxisTickValuesDay().slice(0, -1);

        let dayTableHeaderHtml = "<thead>";

        dayTableHeaderHtml += "<th class=\"tableTopLeft\">" + title + "</th>";

        for (let i = 0; i < headerArray.length; i++) {
            dayTableHeaderHtml += "<th class=\"tableColumn\">" + headerArray[i] + " <br/>" + this.model.get("clockLabel") + "</th>";
        }

        dayTableHeaderHtml += "</thead>";

        return dayTableHeaderHtml;
    },

    /**
     * creates HTML-Code for weekTableHeader
     * @param {Array} weekTableHeaderDateArr - array of dataset header
     * @param {String} title - title of the table
     * @return {String} HTML
     */
    createWeekTableHeader: function (weekTableHeaderDateArr, title) {
        let weekTableHeaderHtml = "<thead>";

        weekTableHeaderHtml += "<th class=\"tableTopLeft\">" + title + "</th>";

        if (weekTableHeaderDateArr !== undefined) {
            if (Array.isArray(weekTableHeaderDateArr) && weekTableHeaderDateArr.length > 0) {
                for (let i = 0; i < weekTableHeaderDateArr.length; i++) {
                    weekTableHeaderHtml += "<th class=\"tableColumn\">" + weekTableHeaderDateArr[i] + "</th>";
                }
            }
        }
        else {
            weekTableHeaderHtml += "<th class=\"tableColumn\"></th>";
        }

        weekTableHeaderHtml += "</thead>";

        return weekTableHeaderHtml;
    },

    /**
     * creates HTML-Code for yearTableHeader
     * @param {String} title - title of the table
     * @return {String} HTML
     */
    createYearTableHeader: function (title) {
        let yearTableHeaderHtml = "<thead>";

        yearTableHeaderHtml += "<th class=\"tableTopLeft\">" + title + "</th>";

        this.model.getXAxisTickValuesYear().forEach(kw => {
            yearTableHeaderHtml += "<th class=\"tableColumn\">" + kw + "</th>";
        });

        yearTableHeaderHtml += "</thead>";
        return yearTableHeaderHtml;
    },

    /**
     * creates and appends tableday
     * @returns {Void} -
     */
    renderDayTableContent: function () {
        let htmlOut = "<table class=\"table table-striped text-align-center table-condensed table-bordered text-nowrap\">";

        if (this.model.get("dayTableContent").length !== 0) {
            htmlOut += this.createDayTableHeader(this.model.get("dayTableContent")[0].title);
        }

        htmlOut += "<tbody>";

        this.$el.find("#tableday").empty();

        this.model.get("dayTableContent").forEach(day => {

            const carsArr = day.carsArr,
                bicyclesArr = day.bicyclesArr,
                trucksArr = day.trucksArr,
                firstColumn = day.firstColumn,
                meansOfTransport = day.meansOfTransport;

            switch (meansOfTransport) {
                case this.model.get("meansOfTransportFahrraeder"):
                    htmlOut += this.createDayTableContent(bicyclesArr, firstColumn, "", "");
                    break;
                case this.model.get("meansOfTransportFahrzeuge"):
                    htmlOut += this.createDayTableContent(carsArr, firstColumn, "", this.model.get("carsHeaderSuffix"));
                    htmlOut += this.createDayTableContent(trucksArr, firstColumn, "", this.model.get("trucksHeaderSuffix"));
                    break;
                default:
            }
        });
        htmlOut += "</table></tbody>";

        this.$el.find("#tableday").append(htmlOut);
    },

    /**
     * generate html for table day
     * @param {Array} carsArr - array of the car results
     * @param {String} firstColumn -
     * @param {String} headerPrefix -
     * @param {String} headerSuffix -
     * @return {String} - returns the generated html
     */
    createDayTableContent: function (carsArr, firstColumn, headerPrefix, headerSuffix) {
        const hourArr = this.model.getXAxisTickValuesDay().slice(0, -1);

        let tableColumnsHtml = "<tr>";

        tableColumnsHtml += "<td class=\"tableFirstColumn\" width=\"165\">" + headerPrefix + firstColumn + " " + headerSuffix + "</td>";

        if (carsArr === undefined) {
            for (let i = 0; i < hourArr.length; i++) {
                tableColumnsHtml += "<td class=\"text-align-center\">&nbsp;</td>";
            }
            return tableColumnsHtml;
        }

        hourArr.forEach(hour => {
            if (carsArr.hasOwnProperty(hour)) {
                tableColumnsHtml += "<td class=\"text-align-center\">" + carsArr[hour] + "</td>";
            }
            else {
                tableColumnsHtml += "<td class=\"text-align-center\"></td>";
            }
        });

        tableColumnsHtml += "</tr>";

        return tableColumnsHtml;
    },

    /**
     * creates and appends tableweek
     * @returns {Void}  -
     */
    renderWeekTableContent: function () {
        let htmlOut = "<table class=\"table table-striped text-align-center table-condensed table-bordered text-nowrap\">";

        this.$el.find("#tableweek").empty();

        this.model.get("weekTableContent").forEach(week => {

            const carsArr = week.carsArr,
                bicyclesArr = week.bicyclesArr,
                trucksArr = week.trucksArr,
                firstColumn = week.firstColumn,
                meansOfTransport = week.meansOfTransport,
                headerDateArr = week.headerDateArr,
                title = week.title;

            htmlOut += this.createWeekTableHeader(headerDateArr, title);

            switch (meansOfTransport) {
                case this.model.get("meansOfTransportFahrraeder"):
                    htmlOut += this.createWeekTableContent(headerDateArr, bicyclesArr, firstColumn, "", "");
                    break;
                case this.model.get("meansOfTransportFahrzeuge"):
                    htmlOut += this.createWeekTableContent(headerDateArr, carsArr, firstColumn, "", this.model.get("carsHeaderSuffix"));
                    htmlOut += this.createWeekTableContent(headerDateArr, trucksArr, firstColumn, "", this.model.get("trucksHeaderSuffix"));
                    break;
                default:
            }
        });
        htmlOut += "</table></tbody>";

        this.$el.find("#tableweek").append(htmlOut);
    },

    /**
     * generate html for week-table
     * @param {Array} headerDateArr -
     * @param {Array} carsArr -
     * @param {String} firstColumn -
     * @param {String} headerPrefix -
     * @param {String} headerSuffix -
     * @return {String} - returns the generated html
     */
    createWeekTableContent: function (headerDateArr, carsArr, firstColumn, headerPrefix, headerSuffix) {
        let tableColumnsHtml = "<tr>";

        tableColumnsHtml += "<td class=\"tableFirstColumn\" width=\"165\">" + headerPrefix + firstColumn + " " + headerSuffix + "</td>";

        headerDateArr.forEach(date => {
            if (carsArr.hasOwnProperty(date)) {
                tableColumnsHtml += "<td class=\"text-align-center\">" + carsArr[date] + "</td>";
            }
            else {
                tableColumnsHtml += "<td class=\"text-align-center\">&nbsp;</td>";
            }
        });

        tableColumnsHtml += "</tr>";

        return tableColumnsHtml;
    },

    /**
     * appends header and columns to year table
     * @param {Backbone.Model} model - trafficCount model
     * @param {Object} value - dataset
     * @returns {void}
     */
    renderYearTableContent: function () {

        let htmlOut = "<table class=\"table table-striped text-align-center table-condensed table-bordered text-nowrap\">";

        if (this.model.get("yearTableContent").length !== 0) {
            htmlOut += this.createYearTableHeader(this.model.get("yearTableContent")[0].title);
        }

        this.$el.find("#tableyear").empty();

        this.model.get("yearTableContent").forEach(year => {

            const carsArr = year.carsArr,
                bicyclesArr = year.bicyclesArr,
                trucksArr = year.trucksArr,
                firstColumn = year.firstColumn,
                meansOfTransport = year.meansOfTransport;

            switch (meansOfTransport) {
                case this.model.get("meansOfTransportFahrraeder"):
                    htmlOut += this.createYearTableContent(bicyclesArr, firstColumn, "", "");
                    break;
                case this.model.get("meansOfTransportFahrzeuge"):
                    htmlOut += this.createYearTableContent(carsArr, firstColumn, "", this.model.get("carsHeaderSuffix"));
                    htmlOut += this.createYearTableContent(trucksArr, firstColumn, "", this.model.get("trucksHeaderSuffix"));
                    break;
                default:
            }
        });
        htmlOut += "</table></tbody>";

        this.$el.find("#tableyear").append(htmlOut);
    },

    /**
     * generate html for year-table
     * @param {Array} carsArr -
     * @param {String} firstColumn -
     * @param {String} headerPrefix -
     * @param {String} headerSuffix -
     * @return {String} - returns the generated html
     */
    createYearTableContent: function (carsArr, firstColumn, headerPrefix, headerSuffix) {
        const calenderWeekArr = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
            "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
            "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
            "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
            "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
            "51", "52", "53"];

        let tableColumnsHtml = "<tr>";

        tableColumnsHtml += "<td class=\"tableFirstColumn\" width=\"165\">" + headerPrefix + firstColumn + " " + headerSuffix + "</td>";

        if (carsArr === undefined) {
            for (let i = 0; i < calenderWeekArr.length; i++) {
                tableColumnsHtml += "<td class=\"text-align-center\">&nbsp;</td>";
            }
            return tableColumnsHtml;
        }

        calenderWeekArr.forEach(kw => {
            if (carsArr.hasOwnProperty(kw)) {
                tableColumnsHtml += "<td class=\"text-align-center\">" + carsArr[kw] + "</td>";
            }
            else {
                tableColumnsHtml += "<td class=\"text-align-center\">&nbsp;</td>";
            }
        });

        tableColumnsHtml += "</tr>";

        return tableColumnsHtml;
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
    },

    renderWeekDatepicker: function () {
        this.$el.find("#weekDateSelector").append(new SnippetDatepickerView({model: this.model.get("weekDatepicker")}).render().el);
    },

    renderYearDatepicker: function () {
        this.$el.find("#yearDateSelector").append(new SnippetDatepickerView({model: this.model.get("yearDatepicker")}).render().el);
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
            this.fixIndicationPosition();
        }
        else {
            this.$el.find($(toggledElementId)).addClass("inactive");
        }
    },

    /**
     * Making the indication position always fixed when the window is scrolled
     * @returns {void}
     */
    fixIndicationPosition: function () {
        const gfiContent = document.querySelector(".gfi-content"),
            indicationContent = document.querySelector(".indication");

        gfiContent.addEventListener("scroll", () => {
            indicationContent.style.cssText = "left: " + gfiContent.scrollLeft + "px";
        });
    },

    destroy: function () {
        this.model.onIsVisibleEvent(null, false);
    }
});

export default TrafficCountView;
