import ThemeView from "../../view";
import SchulentlasseneTemplate from "text-loader!./template.html";

/**
 * @member SchulEntlasseneThemeTemplate
 * @description Template used to create gfi for SchulEntlassene
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulEntlasseneThemeView = ThemeView.extend({
    events: {
        "remove": "destroy"
    },
    tagName: "div",
    className: "schulentlassene-gfi-theme",
    template: _.template(SchulentlasseneTemplate)
});

export default SchulEntlasseneThemeView;
