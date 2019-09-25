import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

const SchulenThemeView = ThemeView.extend({
    tagName: "div",
    className: "gif-schule",
    template: _.template(DefaultTemplate),
    events: {
        "click .gfi-daten .title": "toggleTab",
        "click .gfi-info .title": "toggleTab"
    },

    /**
     * toggle the current tab to decide to show the information or data
     * @param  {event} evt - event that is triggered
     * @returns {void}
     */
    toggleTab: function (evt) {
        var contentId = this.$(evt.currentTarget).attr("value");

        // deactivate all tabs and their contents
        this.$(evt.currentTarget).parent().find("li").each(function (index, li) {
            var tabContentId = $(li).attr("value");

            $(li).removeClass("active");
            $("#" + tabContentId).removeClass("active");
            $("#" + tabContentId).removeClass("in");
        });
        // activate selected tab and its content
        this.$(evt.currentTarget).addClass("active");
        this.$("#" + contentId).addClass("active");
        this.$("#" + contentId).addClass("in");
    }

});

export default SchulenThemeView;
