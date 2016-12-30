define(function (require) {

    var ThemeView = require("modules/gfi/themes/view"),
        DefaultTemplate = require("text!modules/gfi/themes/default/template.html"),
        DefaultThemeView;

    DefaultThemeView = ThemeView.extend({
        tagName: "table",
        className: "table table-condensed table-hover",
        template: _.template(DefaultTemplate)
    });

    return DefaultThemeView;
});
