import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

const SchulenStandorteThemeView = ThemeView.extend({
    tagName: "div",
    className: "gfi-schule",
    template: _.template(DefaultTemplate)
});

export default SchulenStandorteThemeView;
