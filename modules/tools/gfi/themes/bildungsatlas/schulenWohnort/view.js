import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

/**
 * @member SchulenWohnortThemeTemplate
 * @description Template used to create gfi for schulenEinzugsgebiete
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulenWohnortThemeView = ThemeView.extend(/** @lends SchulenWohnortThemeView.prototype */{
    /**
     * @class SchulenWohnortThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    events: {
        "remove": "destroy"
    },
    tagName: "div",
    className: "gfi-schule-einzugsgebiete",
    template: _.template(DefaultTemplate),
    destroy: function () {
        this.model.onIsVisibleEvent(null, false);
    }
});

export default SchulenWohnortThemeView;
