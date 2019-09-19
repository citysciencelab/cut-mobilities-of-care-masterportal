import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";

const SchulenThemeView = ThemeView.extend({
    tagName: "table",
    className: "table table-condensed table-hover",
    template: _.template(DefaultTemplate)
});

export default SchulenThemeView;
