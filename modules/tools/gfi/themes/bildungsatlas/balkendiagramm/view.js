import ThemeView from "../../view";
import BalkendiagrammThemeTemplate from "text-loader!./template.html";

const BalkendiagrammThemeView = ThemeView.extend({
    tagName: "div",
    className: "gfi-bakendiagramm",
    template: _.template(BalkendiagrammThemeTemplate)
});

export default BalkendiagrammThemeView;
