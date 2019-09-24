import ThemeView from "../../view";
import BalkendiagrammThemeTemplate from "text-loader!./template.html";

const BalkendiagrammThemeView = ThemeView.extend({
    tagName: "table",
    className: "table table-condensed table-hover",
    template: _.template(BalkendiagrammThemeTemplate)
});

export default BalkendiagrammThemeView;
