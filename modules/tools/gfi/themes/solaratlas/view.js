import ThemeView from "../view";
import SolaratlasTemplate from "text-loader!./template.html";

const SolaratlasThemeView = ThemeView.extend({
    className: "popover-solaratlas",
    template: _.template(SolaratlasTemplate)
});

export default SolaratlasThemeView;
