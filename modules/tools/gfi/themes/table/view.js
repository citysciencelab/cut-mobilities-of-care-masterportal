define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        TableThemeTemplate = require("text!modules/tools/gfi/themes/table/template.html"),
        TableThemeView;

    TableThemeView = ThemeView.extend({
        tagName: "table",
        className: "table table-striped table-condensed table-gfi table-responsive",
        template: _.template(TableThemeTemplate)
    });

    return TableThemeView;
});
