import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

/**
 * @member SchulenWohnortThemeTemplate
 * @description Template used to create gfi for schulenWohnort
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulenWohnortThemeView = ThemeView.extend(/** @lends SchulenWohnortThemeView.prototype */{
    /**
     * @class SchulenWohnortThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    tagName: "div",
    className: "gfi-school-address",
    template: _.template(DefaultTemplate)
});

export default SchulenWohnortThemeView;
