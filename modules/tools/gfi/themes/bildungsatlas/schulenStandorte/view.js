import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

/**
 * @member SchulenStandorteThemeTemplate
 * @description Template used to create gfi for schulenStandorte
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulenStandorteThemeView = ThemeView.extend(/** @lends SchulenStandorteThemeView.prototype */{
    /**
     * @class SchulenStandorteThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    tagName: "div",
    className: "gfi-schule",
    template: _.template(DefaultTemplate)
});

export default SchulenStandorteThemeView;
