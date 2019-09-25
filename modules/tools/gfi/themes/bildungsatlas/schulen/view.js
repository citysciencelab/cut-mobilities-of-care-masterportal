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
        $(evt.currentTarget).parent().parent().find(".title").toggleClass("show");
        $(evt.currentTarget).parent().parent().find(".details").slideToggle(300);
    }

});

export default SchulenThemeView;
