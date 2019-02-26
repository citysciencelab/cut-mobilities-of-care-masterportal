import ThemeView from "../view";
import ActiveCityMapsTemplate from "text-loader!./template.html";

const ActiveCityMapsThemeView = ThemeView.extend({
    tagName: "table",
    className: "table table-condensed table-hover",
    template: _.template(ActiveCityMapsTemplate)
});

export default ActiveCityMapsThemeView;
