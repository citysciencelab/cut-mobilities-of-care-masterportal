import ThemeView from "../view";
import TableThemeTemplate from "text-loader!./template.html";

const TableThemeView = ThemeView.extend({
    tagName: "div",
    className: "table-wrapper-div",
    template: _.template(TableThemeTemplate)
});

export default TableThemeView;
