define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        ElektroladesaeulenThemeTemplate = require("text!modules/tools/gfi/themes/elektroladesaeulen/template.html"),
        ElektroladesaeulenThemeView;

    ElektroladesaeulenThemeView = ThemeView.extend({
        tagName: "div",
        className: "ladesaeulen",
        template: _.template(ElektroladesaeulenThemeTemplate)
    });

    return ElektroladesaeulenThemeView;
});
