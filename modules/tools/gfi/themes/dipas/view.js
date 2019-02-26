import ThemeView from "../view";
import DipasThemeTemplate from "text-loader!./template.html";

const DipasThemeView = ThemeView.extend({
    className: "dipas-gfi-theme",
    template: _.template(DipasThemeTemplate)
});

export default DipasThemeView;
