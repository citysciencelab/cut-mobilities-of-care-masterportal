import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

const SchulenEinzugsgebieteThemeView = ThemeView.extend(/** @lends SchulenEinzugsgebieteThemeView.prototype */{
    /**
     * @class SchulenEinzugsgebieteThemeView
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

export default SchulenEinzugsgebieteThemeView;
