define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        TableThemeTemplate = require("text!modules/tools/gfi/themes/default/template.html"),
        TableThemeView;

    TableThemeView = ThemeView.extend({
        tagName: "div",
        className: "table-wrapper-div",
        template: _.template(TableThemeTemplate)
    });

    return TableThemeView;
});
