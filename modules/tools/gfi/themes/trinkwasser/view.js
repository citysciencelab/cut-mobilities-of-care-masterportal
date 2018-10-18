import ThemeView from "../view";
import TrinkwasserTemplate from "text-loader!./template.html";

const TrinkwasserThemeView = ThemeView.extend({
    tagName: "table",
    className: "table table-condensed table-hover popover-trinkwasser",
    template: _.template(TrinkwasserTemplate)
});

export default TrinkwasserThemeView;
