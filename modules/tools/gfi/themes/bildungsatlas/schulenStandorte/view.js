import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

const SchulenStandorteThemeView = ThemeView.extend(/** @lends SchulenStandorteThemeView.prototype */{
    /**
     * @class SchulenStandorteThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    tagName: "div",
    className: "gfi-school-location",
    template: _.template(DefaultTemplate)
});

export default SchulenStandorteThemeView;
